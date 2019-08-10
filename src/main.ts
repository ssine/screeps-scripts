import * as _ from 'lodash'
import { run_worker } from './role/worker'
import { run_harvester } from './role/harvester'
import { run_towers } from './structure/tower'
import { pre_execution, spawn_creeps } from './utils'
import { config } from './config'

export const loop = () => {
  pre_execution();

  spawn_creeps(config);

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    switch (creep.memory.role) {
      case 'worker': {
        run_worker(creep);
        break;
      }
      case 'harvester': {
        run_harvester(creep);
        break;
      }
      default: {
        console.log(`unimplemented role: ${creep.memory.role}`);
      }
    }
  }

  run_towers();

}
