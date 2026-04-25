

export const PROBLEMS = [
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    difficulty: 'Easy',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    tags: ['Sorting', 'Array'],
    description: 'Given an array of integers `nums`, sort the array in non-decreasing order using the **selection sort** algorithm and return the sorted array.\n\nA sorted array in non-decreasing order is an array where each element is greater than or equal to all previous elements.',
    examples: [
      { input: 'nums = [7, 4, 1, 5, 3]', output: '[1, 3, 4, 5, 7]', explanation: '1 ≤ 3 ≤ 4 ≤ 5 ≤ 7. The array is sorted.' },
      { input: 'nums = [3, 1, 2]', output: '[1, 2, 3]' },
    ],
    constraints: ['1 <= nums.length <= 1000', '-10^6 <= nums[i] <= 10^6'],
    sampleTestCases: [
      { input: '[7, 4, 1, 5, 3]', expected: '[1, 3, 4, 5, 7]' },
      { input: '[3, 1, 2]',        expected: '[1, 2, 3]' },
    ],
    hiddenTestCases: [
      { input: '[1]',        expected: '[1]' },
      { input: '[-3,-1,-2]', expected: '[-3,-2,-1]' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n#include <stdlib.h>\n\nvoid selectionSort(int* nums, int n) {\n    // Write your solution here\n    \n}\n\nint main() {\n    int nums[] = {7, 4, 1, 5, 3};\n    int n = 5;\n    selectionSort(nums, n);\n    for (int i = 0; i < n; i++) printf("%d ", nums[i]);\n    return 0;\n}',
      'C++':  '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> selectionSort(vector<int>& nums) {\n    // Write your solution here\n    \n}\n\nint main() {\n    vector<int> nums = {7, 4, 1, 5, 3};\n    auto result = selectionSort(nums);\n    for (int x : result) cout << x << " ";\n    return 0;\n}',
      Java:   'import java.util.*;\n\nclass Solution {\n    public int[] selectionSort(int[] nums) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = {7, 4, 1, 5, 3};\n        int[] result = sol.selectionSort(nums);\n        System.out.println(Arrays.toString(result));\n    }\n}',
      Python: 'def selection_sort(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    print(selection_sort([7, 4, 1, 5, 3]))',
    },
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    difficulty: 'Easy',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    tags: ['Sorting', 'Array'],
    description: 'Given an array of integers `nums`, sort the array in non-decreasing order using the **bubble sort** algorithm and return the sorted array.',
    examples: [
      { input: 'nums = [5, 1, 4, 2, 8]', output: '[1, 2, 4, 5, 8]' },
      { input: 'nums = [1, 2, 3]', output: '[1, 2, 3]', explanation: 'Already sorted.' },
    ],
    constraints: ['1 <= nums.length <= 1000', '-10^6 <= nums[i] <= 10^6'],
    sampleTestCases: [
      { input: '[5, 1, 4, 2, 8]', expected: '[1, 2, 4, 5, 8]' },
      { input: '[1, 2, 3]',       expected: '[1, 2, 3]' },
    ],
    hiddenTestCases: [
      { input: '[10,-1,0]', expected: '[-1,0,10]' },
      { input: '[2,2,1]',   expected: '[1,2,2]' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n\nvoid bubbleSort(int* nums, int n) {\n    // Write your solution here\n    \n}\n\nint main() {\n    int nums[] = {5, 1, 4, 2, 8};\n    int n = 5;\n    bubbleSort(nums, n);\n    for (int i = 0; i < n; i++) printf("%d ", nums[i]);\n    return 0;\n}',
      'C++':  '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> bubbleSort(vector<int> nums) {\n    // Write your solution here\n    \n}\n\nint main() {\n    vector<int> nums = {5, 1, 4, 2, 8};\n    auto result = bubbleSort(nums);\n    for (int x : result) cout << x << " ";\n    return 0;\n}',
      Java:   'import java.util.*;\n\nclass Solution {\n    public int[] bubbleSort(int[] nums) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println(Arrays.toString(sol.bubbleSort(new int[]{5,1,4,2,8})));\n    }\n}',
      Python: 'def bubble_sort(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    print(bubble_sort([5, 1, 4, 2, 8]))',
    },
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    difficulty: 'Medium',
    folder: 'Sorting',
    subfolder: 'Algorithms',
    tags: ['Sorting', 'Divide and Conquer'],
    description: 'Given an array of integers `nums`, sort the array in non-decreasing order using the **merge sort** algorithm and return the sorted array.',
    examples: [
      { input: 'nums = [38, 27, 43, 3, 9, 82, 10]', output: '[3, 9, 10, 27, 38, 43, 82]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^6 <= nums[i] <= 10^6'],
    sampleTestCases: [
      { input: '[38, 27, 43, 3, 9, 82, 10]', expected: '[3, 9, 10, 27, 38, 43, 82]' },
    ],
    hiddenTestCases: [
      { input: '[2,1]',     expected: '[1,2]' },
      { input: '[-5,3,-2]', expected: '[-5,-2,3]' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n#include <stdlib.h>\n\nvoid mergeSort(int* nums, int n) {\n    // Write your solution here\n    \n}\n\nint main() {\n    int nums[] = {38, 27, 43, 3};\n    int n = 4;\n    mergeSort(nums, n);\n    for (int i = 0; i < n; i++) printf("%d ", nums[i]);\n    return 0;\n}',
      'C++':  '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> mergeSort(vector<int> nums) {\n    // Write your solution here\n    \n}\n\nint main() {\n    vector<int> nums = {38,27,43,3,9,82,10};\n    auto result = mergeSort(nums);\n    for (int x : result) cout << x << " ";\n    return 0;\n}',
      Java:   'import java.util.*;\n\nclass Solution {\n    public int[] mergeSort(int[] nums) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println(Arrays.toString(sol.mergeSort(new int[]{38,27,43,3,9,82,10})));\n    }\n}',
      Python: 'def merge_sort(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    print(merge_sort([38, 27, 43, 3, 9, 82, 10]))',
    },
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    folder: 'Arrays',
    subfolder: 'Basic',
    tags: ['Array', 'Hash Table'],
    description: 'Given an array of integers `nums` and an integer `target`, return **indices** of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    sampleTestCases: [
      { input: '[2,7,11,15]\n9', expected: '[0,1]' },
      { input: '[3,2,4]\n6',     expected: '[1,2]' },
    ],
    hiddenTestCases: [
      { input: '[3,3]\n6',  expected: '[0,1]' },
      { input: '[1,2,3]\n5', expected: '[1,2]' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int n, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = malloc(2 * sizeof(int));\n    // Write your solution here\n    return result;\n}',
      'C++':  '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};',
      Java:   'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println(Arrays.toString(sol.twoSum(new int[]{2,7,11,15}, 9)));\n    }\n}',
      Python: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    print(two_sum([2, 7, 11, 15], 9))',
    },
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    folder: 'Arrays',
    subfolder: 'Intermediate',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Given an integer array `nums`, find the subarray with the **largest sum** and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    sampleTestCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: '[1]', expected: '1' },
    ],
    hiddenTestCases: [
      { input: '[5,4,-1,7,8]', expected: '23' },
      { input: '[-1]',         expected: '-1' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n\nint maxSubArray(int* nums, int n) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    int nums[] = {-2,1,-3,4,-1,2,1,-5,4};\n    printf("%d\\n", maxSubArray(nums, 9));\n    return 0;\n}',
      'C++':  '#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        \n    }\n};',
      Java:   'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println(sol.maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4}));\n    }\n}',
      Python: 'def max_sub_array(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))',
    },
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    folder: 'Linked Lists',
    subfolder: 'Basic',
    tags: ['Linked List', 'Recursion'],
    description: 'Given the `head` of a singly linked list, **reverse** the list and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]',       output: '[2,1]' },
    ],
    constraints: ['Number of nodes in [0, 5000]', '-5000 <= Node.val <= 5000'],
    sampleTestCases: [
      { input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
      { input: '[1,2]',       expected: '[2,1]' },
    ],
    hiddenTestCases: [
      { input: '[]',  expected: '[]' },
      { input: '[1]', expected: '[1]' },
    ],
    starterCode: {
      C:      'struct ListNode {\n    int val;\n    struct ListNode* next;\n};\n\nstruct ListNode* reverseList(struct ListNode* head) {\n    // Write your solution here\n    return NULL;\n}',
      'C++':  'struct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        \n    }\n};',
      Java:   'class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int x) { val = x; }\n}\n\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        \n    }\n}',
      Python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val  = val\n        self.next = next\n\ndef reverse_list(head):\n    # Write your solution here\n    pass',
    },
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    folder: 'Dynamic Programming',
    subfolder: 'Fundamentals',
    tags: ['Dynamic Programming', 'Math'],
    description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can climb `1` or `2` steps. In how many **distinct ways** can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, or 2+1.' },
    ],
    constraints: ['1 <= n <= 45'],
    sampleTestCases: [
      { input: '2', expected: '2' },
      { input: '3', expected: '3' },
    ],
    hiddenTestCases: [
      { input: '1',  expected: '1' },
      { input: '10', expected: '89' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n\nint climbStairs(int n) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    printf("%d\\n", climbStairs(3));\n    return 0;\n}',
      'C++':  '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        \n    }\n};',
      Java:   'class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        System.out.println(new Solution().climbStairs(3));\n    }\n}',
      Python: 'def climb_stairs(n: int) -> int:\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    print(climb_stairs(3))',
    },
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    folder: 'Graphs',
    subfolder: 'BFS-DFS',
    tags: ['Array', 'DFS', 'BFS', 'Matrix'],
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the **number of islands**.\n\nAn island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.',
    examples: [
      {
        input:  'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
      },
      {
        input:  'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
      },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', "grid[i][j] is '0' or '1'"],
    sampleTestCases: [
      {
        input:    '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        expected: '1',
      },
      {
        input:    '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        expected: '3',
      },
    ],
    hiddenTestCases: [
      { input: '[["1"]]', expected: '1' },
      { input: '[["0"]]', expected: '0' },
    ],
    starterCode: {
      C:      '#include <stdio.h>\n\nint numIslands(char** grid, int m, int n) {\n    // Write your solution here\n    return 0;\n}',
      'C++':  '#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        \n    }\n};',
      Java:   'class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        \n    }\n\n    public static void main(String[] args) {\n        char[][] grid = {{"1","1","0"},{"0","1","0"}};\n        System.out.println(new Solution().numIslands(grid));\n    }\n}',
      Python: 'def num_islands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass',
    },
  },
]

export const getFolders      = ()         => [...new Set(PROBLEMS.map(p => p.folder))]
export const getSubfolders   = (folder)   => [...new Set(PROBLEMS.filter(p => p.folder === folder).map(p => p.subfolder))]
export const getProblems     = (f, sub)   => PROBLEMS.filter(p => p.folder === f && p.subfolder === sub)
export const getProblemById  = (id)       => PROBLEMS.find(p => p.id === id) || null