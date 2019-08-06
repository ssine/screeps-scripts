import { StageConfig } from './config'

declare global {
  interface CreepMemory {
    [key: string]: any
  }
  interface Memory {
    [name: string]: any;
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
  for (let sp_n in Game.spawns) {
    let sp = Game.spawns[sp_n];
    if (sp.spawning) {
      let spawning_creep = Game.creeps[sp.spawning.name];
      sp.room.visual.text(
        '🛠️' + spawning_creep.memory.role,
        sp.pos.x + 1,
        sp.pos.y,
        { align: 'left', opacity: 0.8 });
    }
  }
}

function pre_execution() {
  clear_memory();
  visualize_spawning();
}

function spawn_creeps(config: StageConfig) {
  // select a creep to spawn
  let role_count: {[role_name: string]: number} = {};
  Object.values(Game.creeps).forEach((creep) => {
    role_count[creep.memory.role] = role_count[creep.memory.role] ? 
      role_count[creep.memory.role] + 1 : 1;
  })
  let role_to_spawn: string = '';
  for (let role in config.roles) {
    if (! role_count[role] || role_count[role] < config.roles[role].number) {
      role_to_spawn = role;
      break;
    }
  }
  if (role_to_spawn === '') return;

  // select a spawner
  let spawner: StructureSpawn | null = null;
  for (let sp of Object.values(Game.spawns)) {
    if (! sp.spawning) {
      spawner = sp;
      break;
    }
  }
  if (spawner === null) return;

  let profile = config.roles[role_to_spawn].profile;

  let count_key = `${role_to_spawn}_count`;
  if (! Memory[count_key]) Memory[count_key] = 0;
  let idx = Memory[count_key] + 1;
  let ret = spawner.spawnCreep(profile.body, `${role_to_spawn}_${idx}`, 
    { memory: { role: role_to_spawn, state: 'init' } });
  if (ret === OK) Memory[count_key]++;
  return;
}

export {
  pre_execution,
  spawn_creeps
}
