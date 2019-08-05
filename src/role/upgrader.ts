interface UpgraderProfile {
  body: BodyPartConstant[]
}

function make_upgrader(profile: UpgraderProfile) {
  let new_name = `upgrader_${Game.time}`;
  Game.spawns['Spawn1'].spawnCreep(profile.body, new_name, {
    memory: Object.assign({ role: 'upgrader', state: 'init' }, profile)
  });
}

function run_upgrader(creep: Creep) {
  if (creep.memory.upgrading && creep.carry.energy == 0) {
    creep.memory.upgrading = false;
    creep.say('🔄 harvest');
  }
  if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
    creep.memory.upgrading = true;
    creep.say('⚡ upgrade');
  }

  if (creep.memory.upgrading) {
    if (creep.room.controller == null) throw "no controller in the room!";
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
  else {
    var sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }
}

export { 
  make_upgrader,
  run_upgrader
 };