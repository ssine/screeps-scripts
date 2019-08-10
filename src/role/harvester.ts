/** Harvester
 *  A harvester that harvest energy from source and transfer them to the
 *  closest container. The container must be in range.
 */

function run_harvester(creep: Creep) {
  switch (creep.memory['state']) {
    case 'init': {
      // creep.say('init');
      creep.memory['state'] = 'find_source';
      break;
    }
    case 'find_source': {
      // creep.say('find source');      
      let sources: Source[] = creep.room.find(FIND_SOURCES);
      for (let s of sources) {

        // omit sources with harvester
        let omit_source: boolean = false;
        let screeps_around = creep.room.lookForAtArea(LOOK_CREEPS, s.pos.y-1, s.pos.x-1, s.pos.y+1, s.pos.x+1, true).map(v => v.creep);
        for (let c of screeps_around) {
          if (c.memory['role'] === 'harvester') {
            omit_source = true;
            break;
          }
        }
        if (omit_source) continue;

        // harvest sources with container
        let strucutes_around = creep.room.lookForAtArea(LOOK_STRUCTURES, s.pos.y-1, s.pos.x-1, s.pos.y+1, s.pos.x+1, true).map(v => v.structure);
        let containers: StructureContainer[] = [];
        for (let surronding of strucutes_around) {
          if (surronding instanceof StructureContainer) {
            containers.push(surronding);
          }
        }
        if (containers.length > 0) {
          creep.memory['source'] = s.id;
          creep.memory['target'] = containers[0].id;
          creep.memory['state'] = 'goto_source';
          break;
        }
      }
      break;
    }
    case 'goto_source': {
      // creep.say('goto source');      
      let target: StructureContainer | null = Game.getObjectById(creep.memory['target']);
      if (target === null) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let ret = creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      if (ret !== OK) {
        creep.memory['state'] = 'find_source';
      } else if (creep.pos.x === target.pos.x && creep.pos.y === target.pos.y) {
        creep.memory['state'] = 'harvest';
      }
      break;
    }
    case 'harvest': {
      // creep.say('harvest');      
      let source: Source | null = Game.getObjectById(creep.memory['source']);
      let target: StructureContainer | null = Game.getObjectById(creep.memory['target']);
      if (source === null || target === null) {
        creep.memory['state'] = 'find_source';
        break;
      }
      let ret = creep.harvest(source);
      if (ret !== OK) {
        console.log(`harvester error: ${ret}`);
        creep.memory['state'] = 'find_source';
        break;
      }
      creep.transfer(target, RESOURCE_ENERGY);
      break;
    }
    case 'pause': {
      // creep.say('pause');      
      break;
    }
  }
}

export { run_harvester }