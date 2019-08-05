declare global {
  interface CreepMemory {
    [key: string]: any
  }
}

function clear_memory() {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

function visualize_spawning() {
  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep: any = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns['Spawn1'].pos.x + 1,
      Game.spawns['Spawn1'].pos.y,
      { align: 'left', opacity: 0.8 });
  }
}

function pre_execution() {
  clear_memory();
  visualize_spawning();
}

function get_creep_to_spawn(config: any): string[] {
  return [];
}

export {
  pre_execution,
  get_creep_to_spawn
}