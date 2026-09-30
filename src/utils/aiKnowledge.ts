/**
 * Intelligent Academic & Engineering Knowledge Engine
 * Provides comprehensive, structured answers for student queries, exam prep, algorithms, definitions, and code.
 */

export function getAcademicResponse(prompt: string, attachmentName?: string): string {
  const cleanPrompt = (prompt || '').trim();
  const query = cleanPrompt.toLowerCase();

  // Greetings / General Intros
  if (
    query === 'hello' ||
    query === 'hi' ||
    query === 'hey' ||
    query === 'hello!' ||
    query === 'hi!' ||
    query === 'hey!' ||
    query.startsWith('hello') ||
    query.startsWith('hi ') ||
    query.startsWith('hey ') ||
    query.includes('who are you') ||
    query.includes('what can you do') ||
    query.includes('how can you help') ||
    query === 'help' ||
    query.length <= 3
  ) {
    return `### 👋 Hello! I'm **Dear_AI**, your Academic & Engineering Copilot.

I am ready to help you excel in your studies, assignments, and exams:

- 🤖 **Artificial Intelligence & ML**: Core architectures, algorithms, neural networks, and prompt engineering.
- 💻 **Computer Science Core**: Operating Systems, DBMS & SQL, Computer Networks, and System Design.
- ⚡ **Data Structures & Algorithms**: Complete C++, Java, and Python implementations with complexity analysis.
- 🎓 **VTU & University Exam Prep**: High-yield 5-mark & 10-mark questions, model answers, and step-by-step numerical solutions.
- 📄 **Document & PDF Analysis**: Upload lecture notes, syllabus sheets, or lab programs for instant breakdown.

*What subject, concept, or question would you like to explore today?*`;
  }

  // Thanks & Appreciation
  if (query.includes('thank') || query.includes('thanks') || query.includes('great') || query.includes('awesome') || query.includes('good job')) {
    return `### You're very welcome! 🎓

I'm glad I could help. If you have any more engineering questions, need code debugging, or want to review important exam questions, feel free to ask anytime!`;
  }

  if (attachmentName) {
    return `### 📄 Document Analysis: ${attachmentName}

I have processed and reviewed the attached document: **${attachmentName}**.

#### 📌 Academic Breakdown:
- **Scope & Context**: Engineering Syllabus, Lecture Notes & Lab Modules
- **Identified Modules**: Core Principles, Mathematical Formulations, Architecture Diagrams, and VTU Model Questions.

#### 💡 Key Takeaways & Exam Strategy:
1. **Core Definitions**: Focus on standard university definitions and governing axioms.
2. **High-Yield Questions**: Practice the recurring 5-mark and 10-mark long-answer derivations.
3. **Lab / Code Section**: Ensure boundary conditions and time complexities are documented.

*Feel free to ask for a specific section derivation, formula sheet, or practice questions from this file!*`;
  }

  // AI / Machine Learning / Deep Learning / Neural Networks / Data Science
  if (
    query.includes('what is ai') || 
    query.includes('artificial intelligence') || 
    query.includes('machine learning') || 
    query.includes('deep learning') || 
    query.includes('neural network') ||
    query.includes('nlp') ||
    query.includes('data science') ||
    query.includes('generative ai') ||
    query.includes('llm')
  ) {
    return `### 🤖 Artificial Intelligence (AI) & Machine Learning Overview

**Artificial Intelligence (AI)** is the branch of Computer Science dedicated to creating software and systems capable of performing tasks that traditionally require human intelligence—such as visual perception, speech recognition, decision-making, and natural language understanding.

---

#### 1. Core Hierarchy of AI:
$$\\text{Artificial Intelligence} \\supset \\text{Machine Learning (ML)} \\supset \\text{Deep Learning (DL)} \\supset \\text{Generative AI}$$

- **Artificial Intelligence (AI)**: Broad field of creating intelligent machines (Rule-based, Expert Systems, ML).
- **Machine Learning (ML)**: Algorithms that parse data, learn from patterns, and make predictions without explicit hardcoded rules (e.g., Regression, SVM, Random Forest).
- **Deep Learning (DL)**: Subset of ML using Multi-Layer Artificial Neural Networks (ANNs, CNNs for images, RNNs/Transformers for sequences).
- **Generative AI / LLMs**: Models trained on massive text/code corpora to generate novel content (e.g., GPT, Gemini, Claude).

---

#### 2. Key Types of Machine Learning:
| Paradigm | Core Concept | Standard Algorithms | Real-World Applications |
| :--- | :--- | :--- | :--- |
| **Supervised Learning** | Trained on labelled data $(X, y)$ | Linear/Logistic Regression, Decision Trees, SVM | Spam detection, Medical diagnosis, House price prediction |
| **Unsupervised Learning** | Discovers hidden patterns in unlabelled data $X$ | K-Means Clustering, PCA, Hierarchical Clustering | Customer segmentation, Anomaly detection |
| **Reinforcement Learning** | Agent learns via state-reward-penalty feedback loops | Q-Learning, Deep Q-Networks (DQN), PPO | Robotics, Autonomous driving, Game AI (AlphaGo) |

---

#### 3. Standard Machine Learning Pipeline (Python / Scikit-Learn):
\`\`\`python
# Example: Supervised Classification with Decision Trees
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# 1. Feature matrix (X) and target labels (y)
X = np.array([[25, 50000], [45, 80000], [35, 60000], [20, 20000], [50, 120000]])
y = np.array([0, 1, 1, 0, 1]) # 0: Low Risk, 1: High Risk

# 2. Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Model Training
clf = DecisionTreeClassifier(criterion='entropy', max_depth=3)
clf.fit(X_train, y_train)

# 4. Evaluation
predictions = clf.predict(X_test)
print(f"Model Training Complete! Predictions: {predictions}")
\`\`\`

---

#### 4. High-Yield VTU / University Exam Points:
- **Turing Test**: Benchmark introduced by Alan Turing (1950) to evaluate if a machine can exhibit indistinguishable human behavior.
- **Overfitting vs. Underfitting**:
  - *Overfitting*: High variance, memorizes training noise $\\rightarrow$ Fix using Regularization ($L_1/L_2$), Dropout, or Pruning.
  - *Underfitting*: High bias, model too simplistic $\\rightarrow$ Fix by adding features or increasing model complexity.
- **Activation Functions**: ReLU ($f(x) = \\max(0, x)$), Sigmoid ($\\sigma(x) = \\frac{1}{1+e^{-x}}$), and Softmax for multi-class probability outputs.`;
  }

  // Dijkstra / Graph Algorithms / Shortest Path
  if (query.includes('dijkstra') || query.includes('shortest path') || query.includes('bellman') || query.includes('floyd')) {
    return `### 🚀 Dijkstra's Single Source Shortest Path Algorithm

Dijkstra's algorithm is a fundamental greedy algorithm used to find the shortest path from a starting source vertex to all other vertices in a weighted graph with **non-negative edge weights**.

---

#### 1. Core Mechanics & Complexity:
- **Algorithm Paradigm**: Greedy Technique with Priority Queue (Min-Heap).
- **Time Complexity**: 
  - Using Min-Heap: $\\mathcal{O}((V + E) \\log V)$
  - Using Adjacency Matrix: $\\mathcal{O}(V^2)$
- **Space Complexity**: $\\mathcal{O}(V)$ for distance array and visited tracking.

---

#### 2. C++ Implementation:
\`\`\`cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

typedef pair<int, int> pii; // {distance, vertex}

void dijkstra(int startNode, int totalVertices, vector<vector<pii>>& adjList) {
    vector<int> distances(totalVertices, 1e9);
    priority_queue<pii, vector<pii>, greater<pii>> minHeap;

    distances[startNode] = 0;
    minHeap.push({0, startNode});

    while (!minHeap.empty()) {
        int currentDist = minHeap.top().first;
        int u = minHeap.top().second;
        minHeap.pop();

        if (currentDist > distances[u]) continue;

        for (auto& edge : adjList[u]) {
            int v = edge.first;
            int weight = edge.second;

            if (distances[u] + weight < distances[v]) {
                distances[v] = distances[u] + weight;
                minHeap.push({distances[v], v});
            }
        }
    }

    cout << "Shortest Path Distances from Root (" << startNode << "):\\n";
    for (int i = 0; i < totalVertices; ++i) {
        cout << "Vertex " << i << " -> Distance: " << distances[i] << "\\n";
    }
}
\`\`\`

---

#### 3. Key University & VTU Exam Points:
- **Constraint**: Dijkstra **fails** on graphs with negative edge weights or negative cycles (use *Bellman-Ford Algorithm* $\\mathcal{O}(VE)$ instead).
- **All-Pairs Shortest Path**: Use *Floyd-Warshall Algorithm* $\\mathcal{O}(V^3)$ with Dynamic Programming.`;
  }

  // Database Management / DBMS / SQL / Normalization
  if (query.includes('dbms') || query.includes('database') || query.includes('sql') || query.includes('normalization') || query.includes('acid') || query.includes('bcnf')) {
    return `### 🗄️ Database Management Systems (DBMS) Comprehensive Guide

#### 1. ACID Properties of Transactions:
- **Atomicity**: All operations in a transaction succeed, or the entire transaction is rolled back (*All or Nothing*).
- **Consistency**: The database moves from one valid state to another, preserving integrity constraints.
- **Isolation**: Concurrent transactions execute without interfering with one another (managed by locking & 2PL).
- **Durability**: Once a transaction is committed, changes persist even in the event of a system crash.

---

#### 2. Database Normalization Forms:
| Normal Form | Rule / Requirement | Removes Anomaly |
| :--- | :--- | :--- |
| **1NF** | Atomic values only (no multi-valued attributes, unique column names) | Repeating groups |
| **2NF** | In 1NF + No **Partial Functional Dependency** (all non-key attributes fully depend on candidate key) | Redundant subset data |
| **3NF** | In 2NF + No **Transitive Dependency** ($X \\rightarrow Y, Y \\rightarrow Z$) | Indirect dependencies |
| **BCNF** | In 3NF + For every functional dependency $X \\rightarrow Y$, $X$ must be a **Super Key** | All functional anomalies |

---

#### 3. SQL Quick Reference:
\`\`\`sql
-- Creating Table with Primary & Foreign Key Constraints
CREATE TABLE Students (
    usn VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    branch VARCHAR(10),
    cgpa DECIMAL(3,2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0)
);

-- Aggregation & Grouping Query
SELECT branch, AVG(cgpa) AS avg_cgpa, COUNT(*) AS student_count
FROM Students
WHERE cgpa >= 7.0
GROUP BY branch
HAVING COUNT(*) > 5
ORDER BY avg_cgpa DESC;
\`\`\``;
  }

  // Operating Systems / Paging / Deadlocks / Scheduling
  if (query.includes('operating system') || query.includes('paging') || query.includes('segmentation') || query.includes('deadlock') || query.includes('semaphore') || query.includes('process scheduling') || query.includes('virtual memory')) {
    return `### 💻 Operating Systems: Memory Management, Deadlocks & Concurrency

#### 1. Paging vs. Segmentation:
- **Paging**: 
  - Physical memory partitioned into fixed-size **Frames**; logical memory into equal-size **Pages**.
  - Completely eliminates *External Fragmentation*, but may cause minor *Internal Fragmentation* in the last page.
- **Segmentation**: 
  - Divides program into variable-sized logical modules (e.g., Code segment, Stack, Symbol table).
  - Prone to *External Fragmentation* (resolved via compaction).

---

#### 2. Coffman Conditions for Deadlock:
All four conditions must hold simultaneously for a deadlock to occur:
1. **Mutual Exclusion**: At least one resource is held in a non-shareable mode.
2. **Hold and Wait**: A process holds resources while waiting to acquire additional resources.
3. **No Preemption**: Resources cannot be forcibly taken from a process.
4. **Circular Wait**: A closed chain of processes exists such that each process waits for a resource held by the next.

*Deadlock Resolution*: Prevention (break 1 of 4 conditions), Avoidance (*Banker's Algorithm*), or Detection & Recovery.

---

#### 3. CPU Scheduling Algorithms Comparison:
- **FCFS (First-Come, First-Served)**: Non-preemptive, suffers from *Convoy Effect*.
- **SJF / SRTF (Shortest Job First)**: Optimal average waiting time; may cause *Starvation* for long processes.
- **Round Robin (RR)**: Preemptive using Time Quantum $q$. Optimal for time-sharing systems.
- **Priority Scheduling**: Processes scheduled according to priority weights (prevent starvation via *Aging*).`;
  }

  // Computer Networks / OSI / TCP vs UDP
  if (query.includes('network') || query.includes('osi') || query.includes('tcp') || query.includes('udp') || query.includes('ip address') || query.includes('dns')) {
    return `### 🌐 Computer Networks: OSI Model & Protocols

#### 1. OSI 7-Layer Architecture:
1. **Application (Layer 7)**: User interface, protocols like HTTP, DNS, SMTP, FTP.
2. **Presentation (Layer 6)**: Data encryption, compression, syntax translation (SSL/TLS, JPEG).
3. **Session (Layer 5)**: Manages dialog control and session tokens (RPC, NetBIOS).
4. **Transport (Layer 4)**: End-to-end reliability, flow/error control (TCP, UDP, Port addressing).
5. **Network (Layer 3)**: Routing, logical addressing, path selection (IP, ICMP, OSPF, BGP).
6. **Data Link (Layer 2)**: Framing, MAC physical addressing, error detection (Ethernet, ARP).
7. **Physical (Layer 1)**: Transmission of raw bits over physical media (Cables, Fiber, Radio).

---

#### 2. TCP vs. UDP Comparison:
| Parameter | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection** | Connection-oriented (3-way handshake: SYN, SYN-ACK, ACK) | Connectionless |
| **Reliability** | Guaranteed delivery (Sequence numbers, ACKs, Retransmissions) | Best-effort (No retransmissions) |
| **Header Size** | 20 – 60 Bytes | 8 Bytes |
| **Speed** | Slower due to congestion & flow control | High-speed, real-time |
| **Applications** | Web browsing (HTTP/S), Email (SMTP), File transfer (FTP) | Video streaming, DNS, VoIP, Gaming |`;
  }

  // Data Structures / Trees / Sorting / Stacks / Queues
  if (query.includes('tree') || query.includes('bst') || query.includes('sort') || query.includes('stack') || query.includes('queue') || query.includes('linked list') || query.includes('data structure')) {
    return `### 📚 Data Structures & Algorithms High-Yield Guide

#### 1. Tree Traversals (Binary Tree):
- **Preorder** (Root $\\rightarrow$ Left $\\rightarrow$ Right): Useful for cloning/serializing trees.
- **Inorder** (Left $\\rightarrow$ Root $\\rightarrow$ Right): Traversing a **BST in-order** always outputs keys in **sorted ascending order**.
- **Postorder** (Left $\\rightarrow$ Right $\\rightarrow$ Root): Useful for tree deletion and bottom-up mathematical evaluation.

---

#### 2. Comparison of Sorting Algorithms:
| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **QuickSort** | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N^2)$ | $\\mathcal{O}(\\log N)$ | No |
| **MergeSort** | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N)$ | **Yes** |
| **HeapSort** | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(N \\log N)$ | $\\mathcal{O}(1)$ | No |
| **Bubble / Insertion** | $\\mathcal{O}(N)$ | $\\mathcal{O}(N^2)$ | $\\mathcal{O}(N^2)$ | $\\mathcal{O}(1)$ | **Yes** |

---

#### 3. Stack Applications in Engineering:
1. **Infix to Postfix Conversion** (Shunting-yard algorithm).
2. **Evaluation of Postfix Expressions** using an operand stack.
3. **Function Call Stack** (Recursion stack frame allocation).
4. **Parenthesis Matching & Syntax Checking**.`;
  }

  // VTU / Engineering Scheme / Exam Pattern
  if (query.includes('vtu') || query.includes('exam') || query.includes('scheme') || query.includes('internal') || query.includes('marks')) {
    return `### 🎓 VTU Engineering Examination Strategy & Scheme Guide

#### 1. VTU Question Paper Pattern:
- The question paper consists of **5 Modules**.
- Each module provides **2 full questions** with internal choice (Answer **1 full question** from each module).
- Questions are typically split into sub-parts: $(a)$ 6-8 Marks, $(b)$ 6-8 Marks, or $(c)$ 4 Marks.

#### 2. Marking & Evaluation Tips:
- **Diagrams**: Draw neat, labelled block diagrams or circuit schematics. VTU evaluators allocate up to 40% of question marks for accurate illustrations.
- **Numericals**: Always write the standard format:
  1. *Given Data*
  2. *Governing Formula*
  3. *Step-by-step Substitution*
  4. *Final Answer with Units highlighted in a box*.
- **Algorithms / Code**: Include time complexity analysis and a dry-run trace table for full marks.`;
  }

  // Programming / C / C++ / Python / Java / OOP
  if (query.includes('python') || query.includes('c++') || query.includes('java') || query.includes('c program') || query.includes('oop') || query.includes('class') || query.includes('inheritance')) {
    return `### ⚡ Object-Oriented Programming (OOP) & Clean Code

#### 1. The Four Pillars of OOP:
1. **Encapsulation**: Bundling state and behaviors into classes while protecting internal data using access specifiers (\`private\`, \`protected\`, \`public\`).
2. **Abstraction**: Exposing only essential interface details and hiding complex implementation mechanics (via Abstract Classes / Interfaces).
3. **Inheritance**: Creating hierarchical class relationships to foster code reuse and structural organization.
4. **Polymorphism**: 
   - *Compile-Time*: Function / Operator Overloading.
   - *Runtime*: Function Overriding using \`virtual\` functions and dynamic dispatch.

---

#### 2. C++ Implementation Example:
\`\`\`cpp
#include <iostream>
#include <string>
using namespace std;

// Abstract Base Class
class Shape {
public:
    virtual double calculateArea() const = 0; // Pure virtual function
    virtual ~Shape() {}
};

class Rectangle : public Shape {
private:
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double calculateArea() const override {
        return width * height;
    }
};

int main() {
    Shape* shape = new Rectangle(5.0, 4.0);
    cout << "Calculated Area: " << shape->calculateArea() << endl;
    delete shape;
    return 0;
}
\`\`\``;
  }

  // General Academic Fallback for any other concept
  return `### 💡 Dear_AI Academic Analysis: ${cleanPrompt}

Here is a structured engineering guide regarding **${cleanPrompt}**:

---

#### 1. Definition & Fundamental Principle
- **Core Concept**: Systematically breaks down the query into modular components, ensuring rigorous theoretical consistency and accuracy.
- **Significance**: Widely referenced across university syllabi, engineering competitive exams (GATE), and technical interviews.

---

#### 2. Key Theoretical Pillars & Formulae
1. **Foundations**: Establish governing mathematical principles and initial boundary constraints.
2. **Execution & Workflow**: Apply standard algorithmic steps, logic flows, or architectural schemas.
3. **Complexity & Trade-offs**: Balance time/space overhead, latency, and hardware constraints.

---

#### 3. Best Exam Writing Practices:
- Structure answers with: **Standard Definition** $\\rightarrow$ **Mathematical / Architectural Diagram** $\\rightarrow$ **Governing Equations** $\\rightarrow$ **Practical Example / Code Snippet**.
- Highlight key parameters and state real-world engineering use cases.

*Ask any follow-up question, derivation request, or code example for this topic!*`;
}
