import * as _ from 'lodash'
import { run_harvester } from './role/harvester'
import { roleUpgrader } from './role/upgrader'

declare global {
  interface CreepMemory {
    [key: string]: any
  }
}

export const loop = () => {
  console.log(`Current game tick is ${Game.time}`);

  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  var harvesters = _.filter(Game.creeps, (creep: any) => creep.memory.role == 'harvester');
  console.log('Harvesters: ' + harvesters.length);

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
      roleUpgrader.run(creep);
    }
  }
}
