interface State {
    //const
    // points: Point[];
    // nearestPointMap: { [x: string]: Partial<{ bottom: number; right: number; }> }
    //var
    currentPointIndex: number,
    selectedBridge: Map<string, Bridge>, //`${p_index}_${q_index}`
    currentPointStatus: PointCount[],
}
