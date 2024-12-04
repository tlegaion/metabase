import { setupPluginsForTests } from "__support__/enterprise";
import {
  createMockSettings,
  createMockTokenFeatures,
} from "metabase-types/api/mocks";
import { getMetabaseEEPlugins } from "metabase/plugins/getPlugins";

// describe("when embedding SDK is disabled", () => {
//   beforeEach(async () => {
//     await setupEmbedding({
//       settingValues: { "enable-embedding-sdk": false },
//     });
//   });

//   it("should not show the embedding SDK settings", () => {
//     expect(
//       screen.queryByText("Embedded analytics SDK"),
//     ).not.toBeInTheDocument();
//   });
// });

describe("getMetabaseEEPlugins().PLUGIN_IS_EE_BUILD.isEEBuild()", () => {
  describe("when on OSS codebase", () => {
    beforeEach(() => {
      setupPluginsForTests({ eeBuild: false });
    });

    it("should return false", () => {
      expect(getMetabaseEEPlugins().PLUGIN_IS_EE_BUILD.isEEBuild()).toBeFalsy();
    });
  });

  describe("when on EE codebase", () => {
    beforeEach(() => {
      setupPluginsForTests({ eeBuild: true });
    });

    it("should return true", () => {
      expect(
        getMetabaseEEPlugins().PLUGIN_IS_EE_BUILD.isEEBuild(),
      ).toBeTruthy();
    });
  });

  describe("when on OSS codebase, this time the test runs after a EE one", () => {
    beforeEach(() => {
      setupPluginsForTests({ eeBuild: false });
    });

    it("should return false", () => {
      expect(getMetabaseEEPlugins().PLUGIN_IS_EE_BUILD.isEEBuild()).toBeFalsy();
    });
  });
});

describe("getMetabaseEEPlugins().PLUGIN_EMBEDDING_SDK.isEnabled()", () => {
  describe("when on OSS codebase", () => {
    it("should return false", () => {
      setupPluginsForTests({ eeBuild: false });
      expect(
        getMetabaseEEPlugins().PLUGIN_EMBEDDING_SDK.isEnabled(),
      ).toBeFalsy();
    });
  });

  describe("when on EE codebase with no token features", () => {
    it("should return false", () => {
      setupPluginsForTests({ eeBuild: true });
      expect(
        getMetabaseEEPlugins().PLUGIN_EMBEDDING_SDK.isEnabled(),
      ).toBeFalsy();
    });
  });

  describe("when on EE codebase with only 'hosting' token feature", () => {
    it("should return false", () => {
      setupPluginsForTests({
        eeBuild: true,
        settings: createMockSettings({
          "token-features": createMockTokenFeatures({ hosting: true }),
        }),
      });
      expect(
        getMetabaseEEPlugins().PLUGIN_EMBEDDING_SDK.isEnabled(),
      ).toBeFalsy();
    });
  });

  describe("when on EE codebase with only 'embedding_sdk' token feature", () => {
    it("should return true", () => {
      setupPluginsForTests({
        eeBuild: true,
        settings: createMockSettings({
          "token-features": createMockTokenFeatures({
            embedding_sdk: true,
          }),
        }),
      });
      expect(
        getMetabaseEEPlugins().PLUGIN_EMBEDDING_SDK.isEnabled(),
      ).toBeTruthy();
    });
  });
});
