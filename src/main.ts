import * as _ from 'lodash'
import { run_harvester } from './role/harvester'
import { run_upgrader } from './role/upgrader'
import { pre_execution } from './utils'

declare global {
  interface CreepMemory {
    [key: string]: any
  }
}

export const loop = () => {
  console.log(`Current game tick is ${Game.time}`);

  pre_execution();

  let harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role == 'harvester');

  if (harvesters.length < 2) {
    var newName = 'Harvester' + Game.time;
    console.log('Spawning new harvester: ' + newName);
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
      { memory: { role: 'harvester', state: 'init' } });
  }

  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep: any = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns['Spawn1'].pos.x + 1,
      Game.spawns['Spawn1'].pos.y,
      { align: 'left', opacity: 0.8 });
  }

  for (var name in Game.creeps) {
    var creep: any = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      run_harvester(creep);
    }
    if (creep.memory.role == 'upgrader') {
      run_upgrader(creep);
    }
  }
}
