interface RoleConfig {
  profile: {
    body: BodyPartConstant[];
    [additional_property: string]: any;
  }
  number: number;
}

interface StructureConfig {

}

interface StageConfig {
  roles: {
    [role_name: string]: RoleConfig;
  }
  structures: StructureConfig;
}

let init_config: StageConfig = {
  // stage when collecting basic energy from scratch
  roles: {
    harvester: {
      profile: {
        body: [WORK, CARRY, MOVE],
        source: 'single',
        dest: 'any'
      },
      number: 4
    },
    upgrader: {
      profile: {
        body: [WORK, CARRY, MOVE]
      },
      number: 3
    },
    builder: {
      profile: {
        body: [WORK, CARRY, MOVE]
      },
      number: 5
    }
  },
  structures: {
  }
}

let config = init_config;

export { config, StageConfig }