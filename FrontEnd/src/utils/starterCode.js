

const STARTER_TEMPLATES = {
  'C++': `#include <cmath>
#include <cstdio>
#include <vector>
#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    /* Enter your code here. Read input from STDIN. Print output to STDOUT */

    return 0;
}
`,

  C: `#include <math.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>
#include <limits.h>
#include <stdbool.h>

int main() {
    /* Enter your code here. Read input from STDIN. Print output to STDOUT */

    return 0;
}
`,

  Java: `import java.io.*;
import java.util.*;
import java.text.*;
import java.math.*;
import java.util.regex.*;

public class Solution {

    public static void main(String[] args) {
        /* Enter your code here. Read input from STDIN. Print output to STDOUT */
        Scanner sc = new Scanner(System.in);

    }
}
`,

  Python: `import sys
import math
import os
from collections import defaultdict, Counter

# Read input from STDIN. Print output to STDOUT

def main():
    # Write your solution here
    pass

if __name__ == '__main__':
    main()
`,
}

export function getStarterCode(problem, language) {

  if (problem?.starterCode?.[language]) {
    return problem.starterCode[language]
  }

  return STARTER_TEMPLATES[language] ?? ''
}

export function generateStarterCode(problem) {
  return {
    C:      getStarterCode(problem, 'C'),
    'C++':  getStarterCode(problem, 'C++'),
    Java:   getStarterCode(problem, 'Java'),
    Python: getStarterCode(problem, 'Python'),
  }
}