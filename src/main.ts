import * as _ from 'lodash'
import { run_harvester } from './role/harvester'
import { run_upgrader } from './role/upgrader'
import { run_builder } from './role/builder'
import { pre_execution, spawn_creeps } from './utils'
import { config } from './config'

export const loop = () => {
  console.log(`Current game tick is ${Game.time}`);

  pre_execution();

  spawn_creeps(config);

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    switch (creep.memory.role) {
      case 'harvester': {
        run_harvester(creep);
        break;
      }
      case 'upgrader': {
        run_upgrader(creep);
        break;
      }
      case 'builder': {
        run_builder(creep);
        break;
      }
      default: {
        console.error(`unimplemented role: ${creep.memory.role}`);
      }
    }
  }

}
