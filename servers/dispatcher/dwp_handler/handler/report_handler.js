/// /////////////////////////////////////////////
//
// Copyright (c) 2017 Matheus Medeiros Sarmento
//
/// /////////////////////////////////////////////

const connectionManager = rootRequire('servers/dispatcher/connection_manager')

const Task = rootRequire('database/models/task')

const log = rootRequire('servers/shared/log')

const flags = protocolRequire('dwp/common').Flags
const terminateTask = protocolRequire('dwp/pdu/terminate_task')

module.exports.execute = function (pdu, worker) {
  if (pdu.flags & flags.RESOURCE) {
    worker.resource.outdated = false
    worker.resource.cpu = pdu.resource.cpu
    worker.resource.memory = pdu.resource.memory
  }

  if (pdu.flags & flags.TASKS) {
    Promise.all(pdu.tasks.map(function (taskReceived) {
      // Go through all tasks
      return Task
        .findById(taskReceived.id)
        .then(function (task) {
          if (!task) {
            return
          }

          if (task.isFinished() || task.isCanceled()) {
            // It was canceled or finished. Terminate it
            connectionManager.send(worker.uuid, terminateTask.format({ taskId: taskReceived.id }))
            return
          }

          if (task.worker) {
            // There is a worker executing this instance already
            if (task.startTime < taskReceived.startTime) {
              // Evaluating by the time they started, the 'older' worker will finish faster
              connectionManager.send(worker.uuid, terminateTask.format({ taskId: taskReceived.id }))
              return
            }

            // Evaluating by the time they started, the 'newer' worker will finish faster
            connectionManager.send(task.worker, terminateTask.format({ taskId: taskReceived.id }))
          }

          // Associate this instance to this worker
          task.worker = worker.uuid
          return task.save()
        })
    }))
      .then(() => {
        const taskFilter = { worker: worker.uuid }

        return Task
          .find(taskFilter)
          .then(function (tasks) {
            if (tasks === null) {
              return
            }

            return Promise
              .all(tasks
                .map(task => {
                  for (const taskReceived in pdu.tasks) {
                    if (pdu.tasks[taskReceived].id === task._id) {
                      return;
                    }
                  }

                  return Task.updateToDefaultState(task._id)
                }))
          })
      })
      .then(() => {
        worker.updateRunningInstances()
      })
      .catch(e => {
        log.fatal(e)
      })
  }

  if (pdu.flags & flags.STATE) {
    worker.state = pdu.state
  }

  if (pdu.flags & flags.ALIAS) {
    worker.alias = pdu.alias
  }

  worker
    .save()
    .catch(e => {
      log.fatal(e)
    })
}
