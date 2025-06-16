import { useCallback, useRef, useEffect } from "react";

interface PositionUpdate {
  id: string;
  xPosition: number;
  yPosition: number;
}

export function useNodePositions() {
  // Debounced position updates state
  const pendingPositionUpdates = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const positionUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Function to update node positions via API
  const updateNodePositions = useCallback(async (updates: PositionUpdate[]) => {
    try {
      const response = await fetch("/api/messages/positions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update positions");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update node positions:", error);
      throw error;
    }
  }, []);

  // Debounced handler for position changes
  const handleNodePositionChange = useCallback(
    (nodeId: string, x: number, y: number) => {
      // Add to pending updates
      pendingPositionUpdates.current.set(nodeId, { x, y });

      // Clear existing timeout
      if (positionUpdateTimeout.current) {
        clearTimeout(positionUpdateTimeout.current);
      }

      // Set new timeout to batch updates
      positionUpdateTimeout.current = setTimeout(() => {
        const updates = Array.from(
          pendingPositionUpdates.current.entries()
        ).map(([id, position]: [string, { x: number; y: number }]) => ({
          id,
          xPosition: position.x,
          yPosition: position.y,
        }));

        if (updates.length > 0) {
          updateNodePositions(updates).catch((error) => {
            console.error("Failed to save node positions:", error);
          });
          pendingPositionUpdates.current.clear();
        }
      }, 1000); // Wait 1 second after last position change
    },
    [updateNodePositions]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (positionUpdateTimeout.current) {
        clearTimeout(positionUpdateTimeout.current);
      }
    };
  }, []);

  // Force immediate save of pending positions (useful for component unmount)
  const savePendingPositions = useCallback(async () => {
    if (positionUpdateTimeout.current) {
      clearTimeout(positionUpdateTimeout.current);
    }

    const updates = Array.from(pendingPositionUpdates.current.entries()).map(
      ([id, position]: [string, { x: number; y: number }]) => ({
        id,
        xPosition: position.x,
        yPosition: position.y,
      })
    );

    if (updates.length > 0) {
      try {
        await updateNodePositions(updates);
        pendingPositionUpdates.current.clear();
      } catch (error) {
        console.error("Failed to save pending positions:", error);
      }
    }
  }, [updateNodePositions]);

  return {
    handleNodePositionChange,
    savePendingPositions,
    hasPendingUpdates: () => pendingPositionUpdates.current.size > 0,
  };
}
