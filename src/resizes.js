import monitoring from './monitoring';

monitoring.addModule(function(target, options) {
  const resizeMonitors = [];

  const resizes = new ResizeObserver(entries => {
    entries.forEach(entry => {
      for (const monitor of resizeMonitors) {
        for (let node of monitor.nodes) {
          if (entry.target == node) {
            if (monitor.callback(node, entry) == false) {
              removeResizeMonitor(monitor);
              break;
            }
          }
        }
      }
    });
  });

  const addResizeMonitor = (monitor) => {
    resizeMonitors.push(monitor);

    return {
      cancel: () => removeResizeMonitor(monitor)
    };
  }

  const removeResizeMonitor = (monitor) => {
    const index = resizeMonitors.indexOf(monitor);

    if (index > -1) {
      monitor.mutationMonitor.cancel();
      resizeMonitors.splice(index, 1);
    
      monitor.nodes.forEach(node => {
        const canRemove = resizeMonitors.every(otherMonitor => {
          otherMonitor.nodes.indexOf(node) === -1;
        });

        if (canRemove) {
          resizes.unobserve(node);
        }
      });
    }
  }

  this.resized = (selector, callback) => {
    const nodes = [];

    const mutationMonitor = this.added(selector, node => {
      nodes.push(node);
      resizes.observe(node);
    })

    return addResizeMonitor({
      nodes: nodes,
      selector: selector,
      callback: callback,
      mutationMonitor: mutationMonitor
    });
  }

  return () => {
    resizes.disconnect();
    resizeMonitors.splice(0, resizeMonitors.length);
  }
});