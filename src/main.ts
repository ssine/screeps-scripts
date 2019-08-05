import * as _ from 'lodash'
import { run_harvester } from './role/harvester'
import { run_upgrader } from './role/upgrader'
import { pre_execution, get_creep_to_spawn } from './utils'
import { config } from './config'

let cur_config = config.current;

export const loop = () => {
  console.log(`Current game tick is ${Game.time}`);

  pre_execution();

  let creep_to_spawn = get_creep_to_spawn(cur_config);

  let harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');

  if (harvesters.length < 2) {
    var newName = 'Harvester' + Game.time;
    console.log('Spawning new harvester: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
      { memory: { role: 'harvester', state: 'init' } });
  }

  for (var name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      run_harvester(creep);
    }
    if (creep.memory.role == 'upgrader') {
      run_upgrader(creep);
    }
  }

}
