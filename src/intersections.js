import Monitor from './monitor';

Monitor.modules.push(function(target, options) {
  const intersectMonitors = [];

  const intersections = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      for (const monitor of intersectMonitors) {
        for (let node of monitor.nodes) {
          if (entry.target == node && monitor.entryTest(entry)) {
            if (monitor.callback(node, entry) == false) {
              removeIntersectMonitor(monitor);
              break;
            }
          }
        }
      }
    });
  });

  const addIntersectMonitor = function(monitor) {
    intersectMonitors.push(monitor);

    return {
      cancel: () => removeIntersectMonitor(monitor)
    };
  }

  const removeIntersectMonitor = function(monitor) {
    const index = intersectMonitors.indexOf(monitor);

    if (index > -1) {
      monitor.mutationMonitor.cancel();
      intersectMonitors.splice(index, 1);
    
      monitor.nodes.forEach(node => {
        const canRemove = intersectMonitors.every(otherMonitor => {
          otherMonitor.nodes.indexOf(node) === -1;
        });

        if (canRemove) {
          intersections.unobserve(node);
        }
      });
    }
  }

  const intersect = function(selector, callback, entryTest) {
    const nodes = [];

    const mutationMonitor = this.added(selector, node => {
      nodes.push(node);
      intersections.observe(node);
    })

    return addIntersectMonitor({
      nodes: nodes,
      selector: selector,
      callback: callback,
      mutationMonitor: mutationMonitor,
      entryTest: entryTest
    });
  }

  this.appeared = function(selector, callback) {
    return intersect(selector, callback, entry => entry.isIntersecting);
  }

  this.disappeared = function(selector, callback) {
    return intersect(selector, callback, entry => !entry.isIntersecting);
  }

  return () => {
    intersections.disconnect();
    intersectMonitors.splice(0, intersectMonitors.length);
  }
});