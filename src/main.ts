import * as _ from 'lodash'
import { run_worker } from './role/worker'
import { run_harvester } from './role/harvester'
import { run_porter } from './role/porter'
import { run_upgrader } from './role/upgrader'
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
      case 'porter': {
        run_porter(creep);
        break;
      }
      case 'upgrader': {
        run_upgrader(creep);
        break;
      }
      // builder
      // upgrader
      default: {
        console.log(`unimplemented role: ${creep.memory.role}`);
      }
    }
  }

  run_towers();

}
