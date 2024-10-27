import ChecklistUtil from '../../app/utils/checklist';
import Constants from '../../app/constants/constants';

describe('utils', () => {
  describe('ChecklistUtil', () => {
    describe('findAssetLanguagesAndDependencies', () => {
      it('should return empty result when asset is null or undefined', () => {
        expect(ChecklistUtil.findAssetLanguagesAndDependencies(null)).toEqual({
          languages: [],
          dependencies: [],
        });
        expect(ChecklistUtil.findAssetLanguagesAndDependencies(undefined)).toEqual({
          languages: [],
          dependencies: [],
        });
      });

      it('should return correct languages and dependencies for valid code assets', () => {
        const languages = {
          R: ['r', 'rmd', 'rnw', 'snw'],
          Python: ['py', 'py3', 'pyi'],
          SAS: ['sas'],
          Stata: ['do', 'ado', 'mata'],
          HTML: ['htm', 'html'],
        };
        Object.keys(languages).forEach((lang) => {
          languages[lang].forEach((ext) => {
            expect(
              ChecklistUtil.findAssetLanguagesAndDependencies({
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.CODE],
                uri: `path/to/file.${ext}`,
              }),
            ).toEqual({
              languages: [lang],
              dependencies: [],
            });
          });
        });
      });

      it('should return empty result for non-code assets (data, documentation)', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.DATA],
            uri: 'path/to/file.csv',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });
      });

      it('should return empty result for unmatching content type and extension', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.DATA],
            uri: 'path/to/file.py',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });

        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/file.csv',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });
      });

      it('should return empty result for directory/folder type assets', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.DIRECTORY,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/directory/',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });
      });

      it('should not identify malformed URIs', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/malformed-uri.',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });
      });

      it('should ignore random/unknown extensions that are not in the content types', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/file.cmd',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });
      });

      it('should handle nested assets and recurse properly', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FOLDER,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/folder',
            children: [
              {
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.CODE],
                uri: 'path/to/folder/file1.py',
              },
              {
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.CODE],
                uri: 'path/to/folder/file2.r',
              },
            ],
          }),
        ).toEqual({
          languages: ['Python', 'R'], // don't change the languages ordering in this array
          dependencies: [],
        });
      });

      it('should not crash when asset has no extension in its URI', () => {
        expect(
          ChecklistUtil.findAssetLanguagesAndDependencies({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/file',
          }),
        ).toEqual({
          languages: [],
          dependencies: [],
        });
      });
    });

    describe('findDataFiles', () => {
      it('should return empty result when asset is null or undefined', () => {
        expect(ChecklistUtil.findDataFiles(null)).toEqual({ datafiles: [] });
        expect(ChecklistUtil.findDataFiles(undefined)).toEqual({ datafiles: [] });
      });

      it('should return empty result when asset is not a data file', () => {
        expect(
          ChecklistUtil.findDataFiles({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/file.py',
          }),
        ).toEqual({ datafiles: [] });
      });

      it('should return data file name when asset is a data file', () => {
        expect(
          ChecklistUtil.findDataFiles({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.DATA],
            uri: 'path/to/file.csv',
          }),
        ).toEqual({ datafiles: ['file.csv'] });
      });

      it('should return data file names for nested data files', () => {
        expect(
          ChecklistUtil.findDataFiles({
            type: Constants.AssetType.FOLDER,
            contentTypes: [Constants.AssetContentType.DATA],
            uri: 'path/to/folder',
            children: [
              {
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.DATA],
                uri: 'path/to/folder/file1.csv',
              },
              {
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.DATA],
                uri: 'path/to/folder/file2.csv',
              },
            ],
          }),
        ).toEqual({ datafiles: ['file1.csv', 'file2.csv'] });
      });
    });

    describe('findEntryPointFiles', () => {
      it('should return empty result when entryPoints is null or undefined', () => {
        expect(ChecklistUtil.findEntryPointFiles(null)).toEqual({ entrypoints: [] });
        expect(ChecklistUtil.findEntryPointFiles(undefined)).toEqual({ entrypoints: [] });
      });

      it('should return entry point file names for given entrypoint assets', () => {
        expect(
          ChecklistUtil.findEntryPointFiles([
            {
              uri: 'path/to/file1.py',
            },
            {
              uri: 'path/to/file2.py',
            },
          ]),
        ).toEqual({ entrypoints: ['file1.py', 'file2.py'] });
      });
    });

    describe('findDocumentationFiles', () => {
      it('should return empty result when asset is null or undefined', () => {
        expect(ChecklistUtil.findDocumentationFiles(null)).toEqual({ documentationfiles: [] });
        expect(ChecklistUtil.findDocumentationFiles(undefined)).toEqual({ documentationfiles: [] });
      });

      it('should return empty result when asset is not a documentation file', () => {
        expect(
          ChecklistUtil.findDocumentationFiles({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.CODE],
            uri: 'path/to/file.py',
          }),
        ).toEqual({ documentationfiles: [] });
      });

      it('should return documentation file name when asset is a documentation file', () => {
        expect(
          ChecklistUtil.findDocumentationFiles({
            type: Constants.AssetType.FILE,
            contentTypes: [Constants.AssetContentType.DOCUMENTATION],
            uri: 'path/to/file.md',
          }),
        ).toEqual({ documentationfiles: ['file.md'] });
      });

      it('should return documentation file names for nested documentation files', () => {
        expect(
          ChecklistUtil.findDocumentationFiles({
            type: Constants.AssetType.FOLDER,
            contentTypes: [Constants.AssetContentType.DOCUMENTATION],
            uri: 'path/to/folder',
            children: [
              {
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.DOCUMENTATION],
                uri: 'path/to/folder/file1.md',
              },
              {
                type: Constants.AssetType.FILE,
                contentTypes: [Constants.AssetContentType.DOCUMENTATION],
                uri: 'path/to/folder/file2.md',
              },
            ],
          }),
        ).toEqual({ documentationfiles: ['file1.md', 'file2.md'] });
      });
    });
  });
});
