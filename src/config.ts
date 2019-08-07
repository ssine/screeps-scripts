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
    worker: {
      profile: {
        body: [WORK, CARRY, MOVE],
        source: 'single',
        dest: 'any'
      },
      number: 20
    }
  },
  structures: {
  }
}

let second_config: StageConfig = {
  // stage when collecting basic energy from scratch
  roles: {
    worker: {
      profile: {
        body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        source: 'single',
        dest: 'any'
      },
      number: 15
    }
  },
  structures: {
  }
}

let config = second_config;

export { config, StageConfig }