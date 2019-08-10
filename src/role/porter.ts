/** Porter
 *  Move energy to where it is needed: tower, spawner, controller
 */
import * as _ from 'lodash'

function run_porter(creep: Creep) {
  switch (creep.memory['state']) {
    case 'init': {
      // creep.say('init');
      creep.memory['state'] = 'find_container';
      break;
    }
    case 'find_container': {
      // creep.say('find source');      
      let dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
      if (dropped !== null && dropped.amount >= 350) {
        creep.memory['target'] = dropped.id;
        creep.memory['state'] = 'goto_dropped';
        break;
      }
      let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s instanceof StructureContainer && s.store.energy > 200 && (
          s.pos.lookFor(LOOK_FLAGS).filter(f => f.name.includes('upgrade')).length === 0
        )
      });
      if (container !== null) {
        creep.memory['target'] = container.id;
        creep.memory['state'] = 'goto_container';
      }
      break;
    }
    case 'goto_dropped': {
      let source: Resource | null = Game.getObjectById(creep.memory['target']);
      if (source === null) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let ret = creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (ret !== OK) {
        creep.memory['state'] = 'find_container';
      } else if (creep.pickup(source) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'pickup';
      }
      break;
    }
    case 'goto_container': {
      let target: StructureContainer | null = Game.getObjectById(creep.memory['target']);
      if (target === null) break;
      let ret = creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (ret !== OK) {
        // get another sourece
        creep.memory['state'] = 'find_container';
        break;
      } else if (creep.withdraw(target, RESOURCE_ENERGY) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'withdraw';
      }
      break;
    }
    case 'withdraw': {
      // creep.say('harvest');      
      let target: StructureContainer | null = Game.getObjectById(creep.memory['target']);
      if (target === null) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let ret = creep.withdraw(target, RESOURCE_ENERGY);
      if (ret !== OK) creep.memory['state'] = 'find_container';
      if (creep.carry.energy >= creep.carryCapacity) {
        creep.memory['state'] = 'find_target';
      }
      break;
    }
    case 'pickup': {
      // creep.say('harvest');      
      let source: Resource | null = Game.getObjectById(creep.memory['target']);
      if (source === null) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let ret = creep.pickup(source);
      if (ret !== OK) creep.memory['state'] = 'find_container';
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
          if (structure instanceof StructureExtension || 
              structure instanceof StructureSpawn || 
              structure instanceof StructureTower) {
            return structure.energy < structure.energyCapacity;
          } else return false;
        }
      });
      if (targets.length !== 0 && Math.random() < 0.7) {
        creep.memory['state'] = 'goto_structure';
        creep.memory['target'] = _.sample(targets).id;
        break;
      }

      // then half of the screeps build structures
      targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length !== 0 && Math.random() < 0.3) {
        creep.memory['state'] = 'goto_construction_site';
        creep.memory['target'] = targets[0].id;
        break;
      }
      // left ones upgrades the controller
      let flags = creep.room.find(FIND_FLAGS, {
        filter: f => f.name.includes('upgrade')
      }) as Flag[];
      targets = flags.map(f => {
        let cts = f.pos.look().filter(v => v.type === LOOK_STRUCTURES && v.structure instanceof StructureContainer);
        if (cts.length === 0) return undefined;
        return cts[0].structure;
      }).filter(
        s => s !== undefined && s instanceof StructureContainer && s.store.energy < s.storeCapacity
      );
      if (targets.length !== 0) {
        creep.memory['state'] = 'goto_controller'
        creep.memory['target'] = targets[0].id;
      }
      break;
    }
    case 'goto_structure': {
      // creep.say('goto structure');      
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_target';
        break;
      };
      creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.transfer(structure, RESOURCE_ENERGY) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'transfer';
      }
      break;
    }
    case 'goto_repair': {
      // creep.say('goto structure');      
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_target';
        break;
      };
      creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.repair(structure) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'repair';
      }
      break;
    }
    case 'goto_construction_site': {
      // creep.say('goto contruction site');      
      let site: ConstructionSite | null = Game.getObjectById(creep.memory['target']);
      if (site === null) {
        creep.memory['state'] = 'find_target';
        break;
      };
      creep.moveTo(site, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.build(site) != ERR_NOT_IN_RANGE) {
        creep.memory['state'] = 'build';
      }
      break;
    }
    case 'goto_controller': {
      // creep.say('goto controller');      
      let target: StructureContainer | null = Game.getObjectById(creep.memory['target']);
      if (target === null) {
        creep.memory['state'] = 'find_target';
        break;
      };
      creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (creep.transfer(target, RESOURCE_ENERGY) === OK) {
        creep.memory['state'] = 'find_container';
      }
      break;
    }
    case 'transfer': {
      // creep.say('transfer');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let structure: StructureExtension | StructureSpawn | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.transfer(structure, RESOURCE_ENERGY);
      if (ret !== OK || structure.energy >= structure.energyCapacity) {
        creep.memory['state'] = 'find_target';
      }
      break;
    }
    case 'build': {
      // creep.say('build');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let site: ConstructionSite | null = Game.getObjectById(creep.memory['target']);
      if (site === null) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.build(site);
      if (ret !== OK) creep.memory['state'] = 'find_target';
      break;
    }
    case 'upgrade': {
      // creep.say('upgrade');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let controller: StructureController | undefined = creep.room.controller;
      if (controller === undefined) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.upgradeController(controller);
      if (ret !== OK) creep.memory['state'] = 'find_target';
      break;
    }
    case 'repair': {
      // creep.say('repair');      
      if (creep.carry.energy == 0) {
        creep.memory['state'] = 'find_container';
        break;
      }
      let structure: Structure | null = Game.getObjectById(creep.memory['target']);
      if (structure === null) {
        creep.memory['state'] = 'find_target';
        break;
      }
      let ret = creep.repair(structure);
      if (ret !== OK || structure.hits >= structure.hitsMax) {
        creep.memory['state'] = 'find_target';
      }
      break;
    }
    case 'find_source': {
      creep.memory['state'] = 'find_container';
      break;
    }
    case 'recycle': {
      let spawner: StructureSpawn = Object.values(Game.spawns)[0];
      creep.moveTo(spawner);
    }
  }
}

export {
  run_porter
}

