# 搭桥



### 解决方案

- 1. 构造图结构

        > 1. 节点的相邻节点

    1. 递归各节点

        > 递归方案：
        >
        > 1. 每次寻找未完成count的节点
        > 1. 每层记录该节点的可用边，遍历边的“方案”

    1. 生成节点的可用边的方案

        1. 遍历相邻节点

        1. 判断相邻节点是否可用

            > 1. 相邻节点是否未完成count
            > 1. 遍历当前已选的所有边
            > 1. 判断边是否导致相邻节点被阻断

        1. 当前节点与相邻节点之间，基于两节点剩余的count生成可用边

    1. 基于当前可用边，选择边的选择方案

        > 只考虑bottom和right的位置
        >
        > 最多有8种情况
        >
        > 1. bottom0+right1
        > 1. bottom0+right2
        > 1. bottom1+right0
        > 1. bottom1+right1
        > 1. bottom1+right2
        > 1. bottom2+right0
        > 1. bottom2+right1
        > 1. bottom2+right2
        >
        > 当前节点剩余count与选择方案的映射为
        >
        > ```typescript
        > const cases = {
        >     [0]: [],
        >     [1]: [1,3],
        >     [2]: [2,4,6],
        >     [3]: [5,7],
        >     [4]: [8],
        >     [5]: [8],
        > 	[6]: [8],
        >     [7]: [8],
        > 	[8]: [8],
        > }[restCount]; //值为上述8种方案中的编号
        > ```

    1. 遇到非法情况时返回错误到上一层递归，并清理现场

        > - 当前节点count未完成，但四周节点不存在多余count

    1. 所有节点count完成后，校验全连通性。若不正确，执行步骤4。

        > 校验方案：并查集

    > 节点数为n，总可选边数为m，平均方案使用边数 c
    >
    >  O(n\*(4\*0.5\*c)\*n) = O(2c n^2)  



- 1. 生成所有可用的边

    1. 递归边，判断当前边是否可用

        > 1. 遍历当前已选的所有边
        > 1. 判断当前边是否与任意已选边冲突

    1. 遇到非法情况时返回错误到上一层递归，并清理现场

    1. 递归完成后，校验所有节点count 和全连通性。若不正确，执行步骤4。

    > 节点数为n，总可选边数为m，平均方案使用边数 c
    >
    >  O(m\*(0.5\*c)\*n) = O(m\*c\*n)



### 优化点

1. 每个节点只需关注 right、bottom 位置

1. 递归结构采用bfs转换为循环结构，避免栈溢出

    > 栈的层数为节点总数 / 边总数













# test

- 过程
    1. 节点1，方案 bottom1+right1 
    1. 节点2，方案 bottom2+right0
    1. 节点3，方案 bottom1+right2
    1. 节点4，方案 bottom0+right2
    1. 节点5，方案 bottom1+right0
    1. 节点6，方案 bottom0+right1
    1. 节点7，方案 无
    1. 节点8，方案 bottom0+right2
    1. 节点9，方案 无
    1. 节点10，方案 bottom0+right1
    1. 节点11，方案 无