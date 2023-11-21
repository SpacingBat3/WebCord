import type { NodeDirection, PipewireNode } from "node-pipewire";

const waitForNewNode = async (type: string, direction: NodeDirection) => {
  try {
    const pw = await import("node-pipewire");
    return await pw.waitForNewNode(type, direction);
  } catch (error) {
    console.log("Error waiting for new node");
    console.error(error);
    throw error; // Re-throw the error to propagate it to the caller
  }
};

const unlinkPorts = async (inputPortId: number, outputPortId: number) => {
  try {
    const pw = await import("node-pipewire");

    pw.unlinkPorts(inputPortId, outputPortId);
  } catch (error) {
    console.log("Error unlinking ports");
    console.error(error);
    throw error;
  }
};

const linkNodesNameToId = async (nodeName: string, targetNodeId: number) => {
  try {
    const pw = await import("node-pipewire");
    pw.linkNodesNameToId(nodeName, targetNodeId);
  } catch (error) {
    console.log("Error linking nodes");
    console.error(error);
    throw error;
  }
};

export const setupScreenShareWithPW = async (selectedAudioNodes: string[]) => {
  let screenShareNode: PipewireNode | null | undefined;

  try {
    screenShareNode = await waitForNewNode("Chromium", "Input");
  } catch (error) {
    // Handle the error, or propagate it to the caller
  }

  if (screenShareNode) {
    const pw = await import("node-pipewire");
    const screenSharePorts = screenShareNode.ports.filter((port) => port.direction === "Input");

    if (screenSharePorts.length > 0) {
      const links = pw.getLinks();

      for (const port of screenSharePorts) {
        const micLink = links.find((link) => port.id === link.input_port_id);

        if (micLink) unlinkPorts(port.id, micLink.output_port_id).catch((error) => {
          console.log("Error unlinking ports");
          console.error(error);
        });
      }
    }

    const connectInterval = setInterval(() => {
      const targetNode = pw.getInputNodes().find((node) => screenShareNode?.id === node.id);

      if (targetNode) {
        try {
          for (const nodeName of selectedAudioNodes) {
            linkNodesNameToId(nodeName, targetNode.id).catch((error) => {
              throw error;
            });
          }
        } catch (error) {
          console.log("Error linking nodes");
          console.error(error);
          clearInterval(connectInterval);
        }
      } else {
        clearInterval(connectInterval);
      }
    }, 1000);
  }
};