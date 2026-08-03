// Must be imported before any module that touches sst's Resource proxy,
// which snapshots process.env when its module first loads.
process.env.SST_RESOURCE_PotluckTable = JSON.stringify({
  name: "PotluckTableTest",
  type: "sst.aws.Dynamo",
});

export const TEST_TABLE = "PotluckTableTest";
