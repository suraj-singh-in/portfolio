import List from "@/components/List";
import CodeBlock from "@/components/SyntaxHighlighter";

const constants = {
  basicRecursion: `type fun(params) {
	if(<base_condition>){
		...
		fun(params)
		...
	}
}`,
  staticVariableRecursion: `int recursion_with_static_variable(int n)
{
    static int x = 0;  // created once
    if (n > 0)
    {
        x++;           // increments every recursive call
        return recursion_with_static_variable(n - 1) + x;
    }
    return 0;
}`,
  tailRecursion: `void tail_recursion(int n)
{
    if (n > 0)
    {
        cout << n << endl;
        tail_recursion(n - 1);
    }
}`,
  headRecursion: `void head_recursion(int n)
{
    if (n > 0)
    {
        head_recursion(n - 1);
        cout << n << endl;
    }
}`,
  treeRecursion: `void tree_recursion(int n)
{
    if (n > 0)
    {
        cout << n;s
        tree_recursion(n - 1);
        tree_recursion(n - 1);
    }
}`,
  indirectRecursion: `void A(int n);
void B(int n);

void A(int n) {
    if(n > 0) {
        cout << n << " ";
        B(n - 1);     // calls B
    }
}

void B(int n) {
    if(n > 0) {
        cout << n << " ";
        A(n / 2);     // calls A again
    }
}`,
  nestedRecursion: `int nested(int n) {
    if(n > 100) return n - 10;
    return nested(nested(n + 11));
}
// this is called - - McCarthy 91 function`,

  practiceQuestions: [
    `int sum_of_first_n_natural_number(int n)
{
    if (n <= 0)
        return 0;
    return sum_of_first_n_natural_number(n - 1) + n;
}`,
    `int factorial_of_number(int n)
{
    if (n == 0 || n == 1)
        return 1;
    return factorial_of_number(n - 1) * n;
}`,
    `int power_of_number(int element, int power)
{
    if (power == 0)
        return 1;
    return power_of_number(element, power - 1) * element;
}`,
    `int power_of_number_optamized(int element, int power)
{
    if (power == 0)
        return 1;
    if (power % 2 == 0)
        return power_of_number_optamized(element * element, power / 2);
    else
        return power_of_number_optamized(element * element, (power - 1) / 2) * element;
}`,
    `// e^x = 1 + x + x^2/2! + x^3/3! + .... + n terms
double taylor_series_ePowerx(int x, int n)
{
    static double power = 1, factorial = 1;
    double resultOfTerm;
    if (n == 0)
        return 1;
    else
    {
        resultOfTerm = taylor_series_ePowerx(x, n - 1);
        power = power * x;
        factorial = factorial * n;
        return resultOfTerm + power / factorial;
    }
}`,
    `double taylor_series_ePowerx_using_horner_rule(int x, int n)
{
    static double term;
    if (n == 0)
        return term;
    term = 1 + ((x * term)/ n);
    return taylor_series_ePowerx_using_horner_rule(x, n-1);
}`,
    `int nth_term_fibonacchi_series(int n)
{
    if (n <= 1)
    {
        return n;
    }
    return nth_term_fibonacchi_series(n - 1) + nth_term_fibonacchi_series(n - 2);
}`,
    `int nth_term_fibonacchi_series_optamized(int n)
{
    static int *fibonacchi_series = nullptr;
    
    // Allocate ONCE — only during the first function call
    if (fibonacchi_series == nullptr)
    {
        fibonacchi_series = new int[n + 1];
        // initialize all to -1
        for (int i = 0; i < n + 1; i++)
            fibonacchi_series[i] = -1;
    }
    
    if (n <= 1)
    {
        fibonacchi_series[n] = n;
        return n;
    }

    if(fibonacchi_series[n] != -1) {
        return fibonacchi_series[n];
    }

    fibonacchi_series[n] = nth_term_fibonacchi_series_optamized(n-1) + nth_term_fibonacchi_series_optamized(n-2);
    return fibonacchi_series[n];
}`,
    `int calculate_nCr(int n, int r)
{
    int t1, t2, t3;
    t1 = factorial_of_number(n);
    t2 = factorial_of_number(r);
    t3 = factorial_of_number(n - r);
    return t1 / (t2 * t3);
}

int calculate_nCr_recursion(int n, int r)
{
    if (r == 0 || n == r)
    {
        return 1;
    }
    return calculate_nCr_recursion(n - 1, r - 1) + calculate_nCr_recursion(n - 1, r);
}
`,
    `void tower_of_hanoi(int n, int a, int b, int c)
{
    if (n > 0)
    {
        tower_of_hanoi(n - 1, a, c, b);
        cout << "from " << a << " to " << c << endl;
        tower_of_hanoi(n - 1, b, a, c);s
    }
}`,
  ],
};

const Recursion = () => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Recursion</h1>
      <div className="flex flex-col gap-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        Recursion is a technique where a function calls itself to solve a problem. It breaks a big problem into smaller subproblems, until reaching a
        base condition.
      </div>

      <CodeBlock language="cpp" value={constants.basicRecursion} />

      <h2 className="font-semibold text-xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Recursion with static variable</h2>

      <p>
        A <strong>static variable</strong> inside a function:
      </p>

      <List
        items={[
          <span key={1}>
            Is created <strong>only once</strong>
          </span>,
          <span key={2}>
            <strong>Maintains its value</strong> between function calls
          </span>,
          <span key={3}>
            Lives for the <strong>entire program duration</strong>
          </span>,
          <span key={4}>
            Initialized <strong>only once</strong> (default = 0)
          </span>,
        ]}
      />

      <p>
        <br />
        In recursive functions:
      </p>

      <List
        items={[
          <span key={1}>
            Normal/local variables <strong>reset every call</strong>
          </span>,
          <span key={2}>
            Static variables <strong>remember previous values</strong>
          </span>,
          <span key={3}>This changes the logic and output of recursion</span>,
        ]}
      />

      <CodeBlock language="cpp" value={constants.staticVariableRecursion} />

      <h2 className="font-semibold text-xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Types of Recursion</h2>

      <h3 className="font-semibold text-l mb-4 tracking-tighter text-neutral-900 dark:text-neutral-100">Tail Recursion</h3>
      <p>
        A recursive function where the <strong>recursive call is the last statement</strong> in the function.
        <br />
        No work is done <strong>after</strong> the recursive call.
      </p>
      <CodeBlock language="cpp" value={constants.tailRecursion} />

      <h3 className="font-semibold text-l mb-4 tracking-tighter text-neutral-900 dark:text-neutral-100">Head Recursion</h3>
      <p>
        A recursive function where the <strong>recursive call happens before any processing</strong>.{" "}
      </p>
      <CodeBlock language="cpp" value={constants.headRecursion} />

      <h3 className="font-semibold text-l mb-4 tracking-tighter text-neutral-900 dark:text-neutral-100">Tree Recursion</h3>
      <p>
        A function that makes <strong>more than one recursive call</strong>.
      </p>
      <CodeBlock language="cpp" value={constants.treeRecursion} />

      <h3 className="font-semibold text-l mb-4 tracking-tighter text-neutral-900 dark:text-neutral-100">Indirect Recursion</h3>
      <p>
        When a function <strong>calls another function</strong>, and that function <strong>calls the first one again</strong>.
      </p>
      <CodeBlock language="cpp" value={constants.indirectRecursion} />

      <h3 className="font-semibold text-l mb-4 tracking-tighter text-neutral-900 dark:text-neutral-100">Nested Recursion</h3>
      <p>
        When the <strong>argument</strong> of a recursive function is <strong>another recursive call</strong>.{" "}
      </p>
      <CodeBlock language="cpp" value={constants.nestedRecursion} />

      <h2 className="font-semibold text-xl mb-8 tracking-tighter text-neutral-900 dark:text-neutral-100">Recursion practice questions</h2>

      {constants.practiceQuestions.map((question, index) => (
        <CodeBlock language="cpp" value={question} key={index}/>
      ))}
    </section>
  );
};

export default Recursion;
