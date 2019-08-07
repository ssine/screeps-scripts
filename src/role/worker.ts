import * as _ from 'lodash'

interface WorkerProfile {
  body: BodyPartConstant[],
  source: 'single' | 'even',
  dest: 'any' | 'container' | 'what else?'
}

function make_worker(profile: WorkerProfile) {
  let new_name = `worker_${Game.time}`;
  Game.spawns['Spawn1'].spawnCreep(profile.body, new_name, {
    memory: Object.assign({ role: 'worker', state: 'init' }, profile)
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

function run_worker(creep: Creep) {
  switch (creep.memory['state']) {
    case 'init': {
      // creep.say('init');
      creep.memory['state'] = 'find_source';
      break;
    }
    case 'find_source': {
      // creep.say('find source');      
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
      // creep.say('goto source');      
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
      // creep.say('harvest');      
      let source: Source | null = Game.getObjectById(creep.memory['target']);
      if (source === null) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let ret = creep.harvest(source);
      if (ret === ERR_NOT_IN_RANGE) creep.memory['state'] = 'goto_source';
      if (creep.carry.energy >= creep.carryCapacity) {
        creep.memory['state'] = 'find_target';
        // creep.memory['state'] = 'find_structure';
      }
      break;
    }
    case 'find_target': {
      // creep.say('find target');      
      // ordered by priority
      // first give energy to spawn and extensions
      let targets: any[] = creep.room.find(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
          if (structure instanceof StructureExtension || structure instanceof StructureSpawn) {
            return structure.energy < structure.energyCapacity;
          } else return false;
        }
      });
      if (targets.length !== 0 && Math.random() < 0.6) {
        creep.memory['state'] = 'goto_structure';
        creep.memory['target'] = _.sample(targets).id;
        break;
      }
      targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.hits < structure.hitsMax
      });
      if (targets.length !== 0 && Math.random() < 0.33) {
        creep.memory['state'] = 'goto_repair';
        creep.memory['target'] = targets[0].id;
        break;
      }
      // then half of the screeps build structures
      targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length !== 0 && Math.random() < 0.5) {
        creep.memory['state'] = 'goto_construction_site';
        creep.memory['target'] = targets[0].id;
        break;
      }
      // left ones upgrades the controller
      creep.memory['state'] = 'goto_controller';
      break;
    }
    case 'goto_structure': {
      // creep.say('goto structure');      
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) break;
      creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.transfer(structure, RESOURCE_ENERGY) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'transfer';
      }
      break;
    }
    case 'goto_repair': {
      // creep.say('goto structure');      
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) break;
      creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.repair(structure) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'repair';
      }
      break;
    }
    case 'goto_construction_site': {
      // creep.say('goto contruction site');      
      let site: ConstructionSite | null = Game.getObjectById(creep.memory['target']);
      if (site === null) break;
      creep.moveTo(site, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.build(site) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'build';
      }
      break;
    }
    case 'goto_controller': {
      // creep.say('goto controller');      
      let controller: StructureController | undefined = creep.room.controller;
      if (controller === undefined) break;
      creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.upgradeController(controller) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'upgrade';
      }
      break;
    }
    case 'transfer': {
      // creep.say('transfer');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let structure: StructureExtension | StructureSpawn | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.transfer(structure, RESOURCE_ENERGY);
      if (ret === ERR_NO_PATH || structure.energy >= structure.energyCapacity) {
        creep.memory['state'] = 'find_target';
      }
      break;
    }
    case 'build': {
      // creep.say('build');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let site: ConstructionSite | null = Game.getObjectById(creep.memory['target']);
      if (site === null) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.build(site);
      if (ret === ERR_INVALID_TARGET) creep.memory['state'] = 'find_target';
      break;
    }
    case 'upgrade': {
      // creep.say('upgrade');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let controller: StructureController | undefined = creep.room.controller;
      if (controller === undefined) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.upgradeController(controller);
      if (ret === ERR_NO_PATH) creep.memory['state'] = 'find_target';
      break;
    }
    case 'repair': {
      // creep.say('repair');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.repair(structure);
      if (ret === ERR_INVALID_TARGET || structure.hits >= structure.hitsMax) {
        creep.memory['state'] = 'find_target';
      }
      break;
    }
  }
}

export {
  make_worker,
  run_worker
}
