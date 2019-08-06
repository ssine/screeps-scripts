interface HarvesterProfile {
  body: BodyPartConstant[],
  source: 'single' | 'even',
  dest: 'any' | 'container' | 'what else?'
}

function make_harvester(profile: HarvesterProfile) {
  let new_name = `harvester_${Game.time}`;
  Game.spawns['Spawn1'].spawnCreep(profile.body, new_name, {
    memory: Object.assign({ role: 'harvester', state: 'init' }, profile)
  });
}

function find_closest_source(creep: Creep, exclude_list: Source[]): Source | null {
  let exclude_ids = exclude_list.map(v => v.id);
  let sources: Source[] = [];
  creep.room.find(FIND_SOURCES).forEach((source) => {
    if (exclude_ids.indexOf(source.id) === -1)
      sources.push(source);
  });
  if (sources.length === 0) return null;
  let closest_source = sources[0],
    min_cost = PathFinder.search(creep.pos, sources[0].pos).cost;
  for (let source of sources) {
    let cost = PathFinder.search(creep.pos, source.pos).cost;
    if (cost < min_cost) {
      closest_source = source;
      min_cost = cost;
    }
  }
  return closest_source;
}

function run_harvester(creep: Creep) {
  switch (creep.memory['state']) {
    case 'init': {
      creep.memory['state'] = 'find_source';
      break;
    }
    case 'find_source': {
      let closest_source = find_closest_source(creep, []);
      if (closest_source === null) {
        console.log('no available source!');
        break;
      }
      creep.memory['target'] = closest_source.id;
      creep.memory['state'] = 'goto_source';
      break;
    }
    case 'goto_source': {
      let source: Source | null = Game.getObjectById(creep.memory['target']);
      if (source === null) break;
      let ret = creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (ret === ERR_NO_PATH) {
        // get another sourece
        let another_source = find_closest_source(creep, [source]);
        if (another_source === null) {
          console.log('no available source!');
          break;
        }
        creep.memory['target'] = another_source.id;
      } else if (creep.harvest(source) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'harvest';
      }
      break;
    }
    case 'harvest': {
      let source: Source | null = Game.getObjectById(creep.memory['target']);
      if (source === null) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let ret = creep.harvest(source);
      if (ret === ERR_NOT_IN_RANGE) creep.memory['state'] = 'goto_source';
      if (creep.carry.energy >= creep.carryCapacity) {
        creep.memory['state'] = 'find_structure';
      }
      break;
    }
    case 'find_structure': {
      // find a structure
      let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
          if (structure instanceof StructureExtension || structure instanceof StructureSpawn) {
            return structure.energy < structure.energyCapacity;
          } else return false;
        }
      });
      if (targets.length !== 0) {
        creep.memory['state'] = 'goto_structure';
        creep.memory['target'] = targets[0].id;
      }
      break;
    }
    case 'goto_structure': {
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) break;
      creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.transfer(structure, RESOURCE_ENERGY) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'transfer';
      }
      break;
    }
    case 'transfer': {
      let structure: StructureExtension | StructureSpawn | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_structure';
        break;
      }
      // let ret = creep.transfer(structure, RESOURCE_ENERGY);
      if (structure.energy >= structure.energyCapacity) {
        creep.memory['state'] = 'find_structure';
      } else if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_source';
      }
      break;
    }
  }
}

export {
  make_harvester,
  run_harvester
}
