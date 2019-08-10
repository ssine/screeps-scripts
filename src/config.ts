import * as _ from 'lodash'

interface RoleConfig {
  profile: {
    body: [BodyPartConstant, number][];
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

let config_0: StageConfig = {
  // stage when collecting basic energy from scratch
  roles: {
    worker: {
      profile: {
        body: [[WORK, 1], [CARRY, 1], [MOVE, 1]]
      },
      number: 20
    }
  },
  structures: {
  }
}

let config_1: StageConfig = {
  // use common worker to do every thing
  roles: {
    worker: {
      profile: {
        body: [[WORK, 2], [CARRY, 2], [MOVE, 4]]
      },
      number: 7
    }
  },
  structures: {
  }
}

let config_2: StageConfig = {
  // divert the roles, harvester, worker, etc.
  roles: {
    harvester: {
      // ultimate harvester that harvest 3000 resources in 300 ticks
      // 2 points per WORK, needs 5 
      profile: {
        body: [[WORK, 5], [CARRY, 1], [MOVE, 3]] // 700
      },
      number: 2
    },
    porter: {
      // move energy to where it is needed: tower, spawner, controller
      profile: {
        body: [[WORK, 2], [CARRY, 6], [MOVE, 4]] // 700
      },
      number: 4
    },
    upgrader: {
      // move energy to where it is needed: tower, spawner, controller
      profile: {
        body: [[WORK, 8], [CARRY, 2], [MOVE, 4]] // 1050
      },
      number: 1
    },
  },
  structures: {

  }
}

let config = config_2;

export { config, StageConfig }