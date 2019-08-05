let config = {
  init: {
    // stage when collecting basic energy from scratch
    role: {
      harvester: {
        profile: {
          body: [WORK, CARRY, MOVE],
          source: 'single',
          dest: 'any'
        },
        number: 2
      },
      upgrader: {
        profile: {
          body: []
        },
        number: 1
      }
    },
    sructure: {
    }
  },
  current: {}
}

config.current = config.init;

export { config }