import _ from "underscore";
import { renderWithProviders, screen, within } from "__support__/ui";
import type { SearchResult } from "metabase-types/api";
import { createMockSetupState } from "metabase-types/store/mocks";
import {
  createMockCollection,
  createMockSearchResult,
} from "metabase-types/api/mocks";
import { defaultRootCollection } from "metabase/admin/permissions/pages/CollectionPermissionsPage/tests/setup";
import { groupModels } from "../utils";
import { BrowseModels } from "./BrowseModels";

const renderBrowseModels = (modelCount: number) => {
  const models = mockModels.slice(0, modelCount);
  return renderWithProviders(
    <BrowseModels
      modelsResult={{ data: models, isLoading: false, error: false }}
    />,
    {
      storeInitialState: {
        setup: createMockSetupState({
          locale: { name: "English", code: "en" },
        }),
      },
    },
  );
};

const collectionAlpha = createMockCollection({ id: 0, name: "Alpha" });
const collectionBeta = createMockCollection({ id: 2, name: "Beta" });
const collectionCharlie = createMockCollection({ id: 3, name: "Charlie" });
const collectionDelta = createMockCollection({ id: 4, name: "Delta" });
const collectionZulu = createMockCollection({ id: 5, name: "Zulu" });
const collectionAngstrom = createMockCollection({ id: 6, name: "Ångström" });
const collectionOzgur = createMockCollection({ id: 7, name: "Özgür" });
const metabaseAnalyticsCollection = createMockCollection({
  id: 1,
  name: "Metabase Analytics",
});

const editors = [
  { firstName: "Sully", lastName: "Prudhomme" },
  { firstName: "Theodor", lastName: "Mommsen" },
  { firstName: "Bjørnstjerne", lastName: "Bjørnson" },
  { firstName: "Frédéric", lastName: "Mistral" },
  { firstName: "José", lastName: "Echegaray" },
  { firstName: "Henryk", lastName: "Sienkiewicz" },
  { firstName: "Giosuè", lastName: "Carducci" },
  { firstName: "Rudyard", lastName: "Kipling" },
  { firstName: "Rudolf", lastName: "Eucken" },
  { firstName: "Selma", lastName: "Lagerlöf" },
  { firstName: "Paul", lastName: "Heyse" },
  { firstName: "Maurice", lastName: "Maeterlinck" },
  { firstName: "Gerhart", lastName: "Hauptmann" },
  { firstName: "Rabindranath", lastName: "Tagore" },
  { firstName: "Romain", lastName: "Rolland" },
  { firstName: "Verner", lastName: "von Heidenstam" },
  { firstName: "Karl", lastName: "Gjellerup" },
  { firstName: "Henrik", lastName: "Pontoppidan" },
  { firstName: "Carl", lastName: "Spitteler" },
  { firstName: "Knut", lastName: "Hamsun" },
  { firstName: "Anatole", lastName: "France" },
  { firstName: "Jacinto", lastName: "Benavente" },
  { firstName: "William Butler", lastName: "Yeats" },
  { firstName: "Władysław", lastName: "Reymont" },
  { firstName: "George Bernard", lastName: "Shaw" },
  { firstName: "Grazia", lastName: "Deledda" },
  { firstName: "Henri", lastName: "Bergson" },
];

const mockModels: SearchResult[] = [
  {
    id: 0,
    name: "Model 0",
    collection: collectionAlpha,
    last_editor_first_name: editors[0].firstName,
    last_editor_last_name: editors[0].lastName,
    last_edited_at: "2024-12-15T11:59:59.000Z",
  },
  {
    id: 1,
    name: "1",
    collection: collectionAlpha,
    last_editor_first_name: editors[1].firstName,
    last_editor_last_name: editors[1].lastName,
    last_edited_at: "2024-12-15T11:59:30.000Z",
  },
  {
    id: 2,
    name: "Model 2",
    collection: collectionAlpha,
    last_editor_first_name: editors[2].firstName,
    last_editor_last_name: editors[2].lastName,
    last_edited_at: "2024-12-15T11:59:00.000Z",
  },
  {
    id: 3,
    name: "Model 3",
    collection: collectionBeta,
    last_editor_first_name: editors[3].firstName,
    last_editor_last_name: editors[3].lastName,
    last_edited_at: "2024-12-15T11:50:00.000Z",
  },
  {
    id: 4,
    name: "Model 4",
    collection: collectionBeta,
    last_editor_first_name: editors[4].firstName,
    last_editor_last_name: editors[4].lastName,
    last_edited_at: "2024-12-15T11:00:00.000Z",
  },
  {
    id: 5,
    name: "Model 5",
    collection: collectionBeta,
    last_editor_first_name: editors[5].firstName,
    last_editor_last_name: editors[5].lastName,
    last_edited_at: "2024-12-14T22:00:00.000Z",
  },
  {
    id: 6,
    name: "Model 6",
    collection: collectionCharlie,
    last_editor_first_name: editors[6].firstName,
    last_editor_last_name: editors[6].lastName,
    last_edited_at: "2024-12-14T12:00:00.000Z",
  },
  {
    id: 7,
    name: "Model 7",
    collection: collectionCharlie,
    last_editor_first_name: editors[7].firstName,
    last_editor_last_name: editors[7].lastName,
    last_edited_at: "2024-12-10T12:00:00.000Z",
  },
  {
    id: 8,
    name: "Model 8",
    collection: collectionCharlie,
    last_editor_first_name: editors[8].firstName,
    last_editor_last_name: editors[8].lastName,
    last_edited_at: "2024-11-15T12:00:00.000Z",
  },
  {
    id: 9,
    name: "Model 9",
    collection: collectionDelta,
    last_editor_first_name: editors[9].firstName,
    last_editor_last_name: editors[9].lastName,
    last_edited_at: "2024-02-15T12:00:00.000Z",
  },
  {
    id: 10,
    name: "Model 10",
    collection: collectionDelta,
    last_editor_first_name: editors[10].firstName,
    last_editor_last_name: editors[10].lastName,
    last_edited_at: "2023-12-15T12:00:00.000Z",
  },
  {
    id: 11,
    name: "Model 11",
    collection: collectionDelta,
    last_editor_first_name: editors[11].firstName,
    last_editor_last_name: editors[11].lastName,
    last_edited_at: "2020-01-01T00:00:00.000Z",
  },
  {
    id: 12,
    name: "Model 12",
    collection: collectionZulu,
    last_editor_first_name: editors[12].firstName,
    last_editor_last_name: editors[12].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 13,
    name: "Model 13",
    collection: collectionZulu,
    last_editor_first_name: editors[13].firstName,
    last_editor_last_name: editors[13].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 14,
    name: "Model 14",
    collection: collectionZulu,
    last_editor_first_name: editors[14].firstName,
    last_editor_last_name: editors[14].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 15,
    name: "Model 15",
    collection: collectionAngstrom,
    last_editor_first_name: editors[15].firstName,
    last_editor_last_name: editors[15].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 16,
    name: "Model 16",
    collection: collectionAngstrom,
    last_editor_first_name: editors[16].firstName,
    last_editor_last_name: editors[16].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 17,
    name: "Model 17",
    collection: collectionAngstrom,
    last_editor_first_name: editors[17].firstName,
    last_editor_last_name: editors[17].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 18,
    name: "Model 18",
    collection: collectionOzgur,
    last_editor_first_name: editors[18].firstName,
    last_editor_last_name: editors[18].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 19,
    name: "Model 19",
    collection: collectionOzgur,
    last_editor_first_name: editors[19].firstName,
    last_editor_last_name: editors[19].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 20,
    name: "Model 20",
    collection: collectionOzgur,
    last_editor_first_name: editors[20].firstName,
    last_editor_last_name: editors[20].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 21,
    name: "Model 21",
    collection: defaultRootCollection,
    last_editor_first_name: editors[21].firstName,
    last_editor_last_name: editors[21].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 22,
    name: "Model 22",
    collection: defaultRootCollection,
    last_editor_first_name: editors[22].firstName,
    last_editor_last_name: editors[22].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 23,
    name: "Model 23",
    collection: defaultRootCollection,
    last_editor_first_name: editors[23].firstName,
    last_editor_last_name: editors[23].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 24,
    name: "Model 24",
    collection: defaultRootCollection,
    last_editor_first_name: editors[24].firstName,
    last_editor_last_name: editors[24].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 25,
    name: "Model 25",
    collection: defaultRootCollection,
    last_editor_first_name: editors[25].firstName,
    last_editor_last_name: editors[25].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 26,
    name: "Model 26",
    collection: defaultRootCollection,
    last_editor_first_name: editors[26].firstName,
    last_editor_last_name: editors[26].lastName,
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
  {
    id: 27,
    name: "Model 27",
    collection: metabaseAnalyticsCollection,
    last_editor_common_name: "Metabase Internal",
    last_edited_at: "2000-01-01T00:00:00.000Z",
  },
].map(model => createMockSearchResult(model));

describe("BrowseModels", () => {
  it("displays 'No models here yet' in the Models tab when no models exist", async () => {
    renderBrowseModels(0);
    expect(await screen.findByText("No models here yet")).toBeInTheDocument();
  });
  it("displays models if some exist", async () => {
    renderBrowseModels(10);
    for (let i = 0; i < 10; i++) {
      expect(await screen.findByText(`Model ${i}`)).toBeInTheDocument();
    }
  });
  it("displays models, organized by parent collection", async () => {
    renderBrowseModels(10);
    // Three <a> tags representing models have aria-labelledby="collection-1 model-$id",
    // and "collection-1" is the id of an element containing text 'Collection 1',
    // so the following line finds those <a> tags.
    const modelsInCollection1 = await screen.findAllByLabelText("Alpha");
    expect(modelsInCollection1).toHaveLength(3);
    const modelsInCollection2 = await screen.findAllByLabelText("Beta");
    expect(modelsInCollection2).toHaveLength(3);
  });
  it("displays the Our Analytics collection if it has a model", async () => {
    renderBrowseModels(23);
    const modelsInOurAnalytics = await screen.findAllByLabelText(
      "Our analytics",
    );
    expect(modelsInOurAnalytics).toHaveLength(2);
  });
  it("displays last edited information about models", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-12-15T12:00:00.000Z"));

    renderBrowseModels(12);
    const howLongAgo = /\d+(min|h|d|mo|yr)/;
    const findWhenModelWasEdited = async (modelName: string) =>
      (
        await within(await screen.findByLabelText(modelName)).findByText(
          howLongAgo,
        )
      )?.textContent?.match(howLongAgo)?.[0];

    expect(await findWhenModelWasEdited("Model 0")).toBe("1min");
    expect(await findWhenModelWasEdited("Model 1")).toBe("1min");
    expect(await findWhenModelWasEdited("Model 2")).toBe("1min");
    expect(await findWhenModelWasEdited("Model 3")).toBe("10min");
    expect(await findWhenModelWasEdited("Model 4")).toBe("1h");
    expect(await findWhenModelWasEdited("Model 5")).toBe("14h");
    expect(await findWhenModelWasEdited("Model 6")).toBe("1d");
    expect(await findWhenModelWasEdited("Model 7")).toBe("5d");
    expect(await findWhenModelWasEdited("Model 8")).toBe("1mo");
    expect(await findWhenModelWasEdited("Model 9")).toBe("10mo");
    expect(await findWhenModelWasEdited("Model 10")).toBe("1yr");
    expect(await findWhenModelWasEdited("Model 11")).toBe("5yr");

    jest.useRealTimers();
  });
  it("has a function that groups models by collection, sorting the collections alphabetically when English is the locale", () => {
    const groupedModels = groupModels(mockModels, "en-US");
    expect(groupedModels[0][0].collection.name).toEqual("Alpha");
    expect(groupedModels[0]).toHaveLength(3);
    expect(groupedModels[1][0].collection.name).toEqual("Ångström");
    expect(groupedModels[1]).toHaveLength(3);
    expect(groupedModels[2][0].collection.name).toEqual("Beta");
    expect(groupedModels[2]).toHaveLength(3);
    expect(groupedModels[3][0].collection.name).toEqual("Charlie");
    expect(groupedModels[3]).toHaveLength(3);
    expect(groupedModels[4][0].collection.name).toEqual("Delta");
    expect(groupedModels[4]).toHaveLength(3);
    expect(groupedModels[5][0].collection.name).toEqual("Our analytics");
    expect(groupedModels[5]).toHaveLength(2);
    expect(groupedModels[6][0].collection.name).toEqual("Özgür");
    expect(groupedModels[6]).toHaveLength(3);
    expect(groupedModels[7][0].collection.name).toEqual("Zulu");
    expect(groupedModels[7]).toHaveLength(3);
  });

  it("has a function that groups models by collection, sorting the collections alphabetically when Swedish is the locale", () => {
    const groupedModels = groupModels(mockModels, "sv-SV");
    expect(groupedModels[0][0].collection.name).toEqual("Alpha");
    expect(groupedModels[0]).toHaveLength(3);
    expect(groupedModels[1][0].collection.name).toEqual("Beta");
    expect(groupedModels[1]).toHaveLength(3);
    expect(groupedModels[2][0].collection.name).toEqual("Charlie");
    expect(groupedModels[2]).toHaveLength(3);
    expect(groupedModels[3][0].collection.name).toEqual("Delta");
    expect(groupedModels[3]).toHaveLength(3);
    expect(groupedModels[4][0].collection.name).toEqual("Our analytics");
    expect(groupedModels[4]).toHaveLength(2);
    expect(groupedModels[5][0].collection.name).toEqual("Zulu");
    expect(groupedModels[5]).toHaveLength(3);
    expect(groupedModels[6][0].collection.name).toEqual("Ångström");
    expect(groupedModels[6]).toHaveLength(3);
    expect(groupedModels[7][0].collection.name).toEqual("Özgür");
    expect(groupedModels[7]).toHaveLength(3);
  });

  it("displays the last editor's name, abbreviated", async () => {
    renderBrowseModels(28);
    const namesInDocument = (await screen.findAllByRole("note"))
      .map(note => note.innerHTML.split("<")[0].trim())
      .sort();
    const expectedNames = editors.map(
      editor => `${editor.firstName} ${editor.lastName[0].toUpperCase()}`,
    );
    // Expect that Metabase Internal (unabbreviated) is the name
    // used for the Metabase Analytics collection
    expectedNames.push("Metabase Internal");
    expectedNames.sort();
    expect(namesInDocument).toEqual(expectedNames);
  });
});
