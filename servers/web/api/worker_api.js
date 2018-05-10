﻿
const Worker = databaseRequire('models/worker')

const interfaceManager = rootRequire('servers/shared/interface_manager')

module.exports = function (app) {
  app.post('/api/worker/pause', function (req, res) {
    interfaceManager.pauseWorker(req.body.address)
  })

  app.post('/api/worker/resume', function (req, res) {
    interfaceManager.resumeWorker(req.body.address)
  })

  app.post('/api/worker/stop', function (req, res) {
    interfaceManager.stopWorker(req.body.address)
  })

  app.get('/api/worker/get_all', function (req, res) {
    Worker
      .find({}, '-_id')
      .then(function (workers) {
        res.send(workers)
      }).catch(function (e) {
        console.log(e)
      })
  })
}