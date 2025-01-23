---
title: "Think Less, Achieve More: Cut Reasoning Costs by 50% Without Sacrificing Accuracy"
slug: reduce-overthinking
description: "We introduce Sky-T1-32B-Flash, our reasoning model that cuts generation length by up to 50% while maintaining accuracy"
category:
  - One
tags:
  - Post-Training
  - Preference-Optimization
  - Reinforcement-Learning
pubDate: 2025-01-23
cover: https://raw.githubusercontent.com/NovaSky-AI/novasky-ai.github.io/main/assets/images/blue-bird-flash.jpeg
coverAlt: Blue Bird Flash
author: NovaSky Team
---

<!-- TODO: add links -->
<!-- TODO: add authors -->

We are excited to introduce **Sky-T1-32B-Flash**, our updated reasoning language model that significantly reduces overthinking, **slashing inference costs on challenging questions by up to 57%**. This enhancement decreases generation length while preserving accuracy across domains such as mathematics, coding, science, and general knowledge, and **requires only $275 for the complete training recipe** using 8xH100s according to Lambda Cloud pricing. To foster transparency and collaboration, we have open-sourced the full pipeline—from data generation and pre-processing to reinforcement learning (RL) training and evaluation scripts—and openly provide the model weights and data, enabling easy reproduction. 

![img](https://raw.githubusercontent.com/NovaSky-AI/novasky-ai.github.io/main/assets/images/reduce-overthinking/headline-plot.png)
**Figure 1:** Our new model significantly reduces generated token lengths while maintaining strong performance on challenging benchmarks.

## Benefits of reducing overthinking
Reducing overthinking effectively improves efficiency and scalability by reducing redundant or unnecessary token generation. This improvement not only greatly reduces inference costs for reasoning models, but also offers multiple downstream benefits. First, the accelerated response delivery provides a much higher-quality user experience. Further, with more efficient reasoning, test-time generation methods such as Best-of-N, Majority Vote, or Monte Carlo Tree Search can yield higher accuracy within fixed computational budgets. It also streamlines data generation in self-training pipelines, which are often bottlenecked by large-scale data generation runs.

## How to reduce overthinking?
Our approach to reduce overthinking builds on the self-training recipe proposed in recent work with important enhancements to improve accuracy in challenging benchmarks across multiple domains. A challenge of reducing overthinking is to prevent the model from underthinking, where the model proposes a final solution without sufficiently validating it. This challenge is especially highlighted in the most challenging benchmarks where extensive double-checking and backtracking are required. Ideally, the model learns to adjust the depth of its reasoning based on the complexity of the question.

Our training process involves three primary stages: data generation, response rewriting, and RL. 

### Stage 1) Data Generation
We used Sky-T1-32B-Preview to generate responses to the 12K questions in the PRM800K dataset. For each question, we used a temperature of 1.0 and generated 8 responses to create a diversity of response lengths. We then formed preference pairs to contrast “verbose” vs. “concise” solutions. Specifically, from the generated responses, we picked the shortest correct response as the positive example and the longest correct response as the negative example. We discarded the rest of the generated responses, and discard any questions that did not produce at least two correct responses. We hypothesize that by preference optimization over such pairs we can encourage the model to reduce overthinking. 

Preference optimization with these pairs reduced generation lengths and mostly maintained accuracy on several benchmarks (MATH500, GPQA, MMLU), however, we observed accuracy degradation on challenging problems in coding (LiveCodeBench-Medium and -Hard) and the most challenging math suites, AIME24 and  MATH500 Level 5. These results suggest that the model was underthinking in cases requiring more complex reasoning. To address this, we used the initial dataset of 8 responses per question to add 1.6K preference pairs to our training data, where the positive example is the shortest incorrect response and the negative example is the shortest correct response that is also longer than the incorrect response, ensuring the model retained its ability to engage in deeper reasoning when necessary. This new data mix led to improved performance on the challenging benchmarks, bringing it up to par with Sky-T1-32B-Preview.

> **Recipe Enhancement #1:** Incorporating {short incorrect response, long correct response} into the preference pair dataset to encourage complex thinking for challenging problems.

Interestingly, preference optimization with this math-only dataset reduced generation length by >25% in the coding domain while maintaining accuracy on LCB-Easy. However, we observed a drop in accuracy in the more challenging benchmarks LCB-Medium and -Hard, so we added 500 more preference pairs generated by Sky-T1-32B-Preview on the TACO dataset. We again generated 8 responses with a temperature of 1.0 and created preference pairs with the shortest and longest correct responses.

> **Recipe Enhancement #2:** Incorporating a small number of coding preference pairs simultaneously boosts coding accuracy and further reduces coding generation lengths. 

Stage 1 required ~8 hours on 8xH100-80GB for a total of ~$190 according to Lambda Cloud pricing.

### Stage 2) Response Rewriting
We refined positive samples by removing unnecessary sub-solutions. The model’s reasoning sequences often include multiple proposed solutions each followed by double-checking transitions such as “Alternatively…,” “But wait…,” or “Let me reconsider…”. For easier questions, these transitions rarely lead to an altered answer but can extend the response length significantly. Using techniques inspired by recent work, we use Llama3.3-70B to separate the solutions within a response then rewrite the response to include only the first correct sub-solution (FCS) and one additional sub-solution (+1). This pruning approach removes most of the unnecessary sub-solutions, reducing the sequence length of positive samples, but includes a single additional sub-solution to maintain the model’s long chain-of-thought reasoning structure. 

Following prior work, we also explored rewriting the response to include up to the first correct solution (FCS) or up to the second correct solution (FCS+Reflection), but found our FCS+1 approach to achieve lowest generation lengths while maintaining accuracy. For coding samples, we did not perform response rewriting. We could not apply our FCS+1 approach to coding because responses almost never propose multiple complete code blocks as solutions, though we believe there is opportunity to remove significant redundancy in coding responses. We have open-sourced the response rewriting pipeline to enable researchers to easily explore alternative methods. 

> **Recipe Enhancement #3:** Rewriting positive preference math examples to maintain only the first correct solution and one additional solution (FCS+1) maintains accuracy (unlike FCS) and produces shorter generation lengths (relative to FCS+R). 

Stage 2 required ~1 hour on 8xH100-80GB for a total of ~$25 according to Lambda Cloud pricing.

### Stage 3) RL - Preference Optimization
We employed SimPO for preference optimization. SimPO is closely related to DPO, but incorporates a length-normalized implicit reward into the optimization approach, which leads to shorter sequence lengths relative DPO. Further, SimPO eliminates the need for the reference model required by DPO, making preference optimization less compute-intensive and therefore cheaper. As an alternative to preference optimization, we also explored using only SFT with the shortest responses, but found sequence lengths were only marginally reduced (<5%). In Table 2, we include ablations for DPO using the same preference pairs as described in Stage (2) and for SFT using the shortest responses.
We start with Sky-T1-32B-Preview as our base model and train with SimPO for 1 epoch and a batch size of 96. We found SimPO results to be sensitive to hyperparameter settings and performed limited exploration within the following space: learning rate = {1e-7, 5e-7, 1e-6}, gamma = {0.3, 0.5, 1.0}, beta = {2.0, 2.5}. We achieved the best performance with a learning rate of 5e-7, gamma of 0.5, and beta of 2.0.  We use Llama-Factory to perform training.
Stage 3 required ~2.5 hours on 8xH100-80GB for a total of ~$60 according to Lambda Cloud pricing.



## Results
**Sky-T1-32B-Flash** maintains **Sky-T1-32B-Preview**’s accuracy, the suite of challenging benchmarks, and consistently reduces generation lengths by over 30% relative. Perhaps most notably, coding sequence lengths are reduced by 47% and 57% for LiveCodeBench Medium and Hard, respectively. 
<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th>Sky-T1-32B-Preview</th>
      <th style="background-color: #bfbfbf;">Sky-T1-32B-Flash</th>
      <th>QwQ-32B-Preview</th>
      <th>DeepSeek-R1-Distill-Qwen-32B</th>
      <th>Qwen2.5-32B-Instruct</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Math500</td>
      <td>Acc.</td>
      <td>88.6</td>
      <td style="background-color: #bfbfbf;">88.6 **(0%)**</td>
      <td>89.2</td>
      <td>90.8</td>
      <td>76.2</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>2124</td>
      <td style="background-color: #bfbfbf;">1417 **(-33%)**</td>
      <td>2089</td>
      <td>2010</td>
      <td>522</td>
    </tr>
    <tr>
      <td>AIME24</td>
      <td>Acc.</td>
      <td>43.30%</td>
      <td style="background-color: #bfbfbf;">43.3 **(0%)**</td>
      <td>50</td>
      <td>66.7</td>
      <td>16.7</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>6881</td>
      <td style="background-color: #bfbfbf;">4365 (-37%)</td>
      <td>7379</td>
      <td>9173</td>
      <td>970</td>
    </tr>
    <tr>
      <td>LCB Easy</td>
      <td>Acc.</td>
      <td>87.4</td>
      <td style="background-color: #bfbfbf;">89.0 (+1.6%)</td>
      <td>90.7</td>
      <td>91.2</td>
      <td>84.6</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>3415</td>
      <td style="background-color: #bfbfbf;">2265 (-34%)</td>
      <td>3255</td>
      <td>2775</td>
      <td>414</td>
    </tr>
    <tr>
      <td>LCB Medium</td>
      <td>Acc.</td>
      <td>56.8</td>
      <td style="background-color: #bfbfbf;">56.3 (-0.5%)</td>
      <td>56.3</td>
      <td>76.7</td>
      <td>40.8</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>8263</td>
      <td style="background-color: #bfbfbf;">4389 (-47%)</td>
      <td>6742</td>
      <td>6324</td>
      <td>535</td>
    </tr>
    <tr>
      <td>LCB Hard</td>
      <td>Acc.</td>
      <td>17.9</td>
      <td style="background-color: #bfbfbf;">17.9 (0%)</td>
      <td>17.1</td>
      <td>38.2</td>
      <td>9.8</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>14564</td>
      <td style="background-color: #bfbfbf;">6199 (-57%)</td>
      <td>10450</td>
      <td>10448</td>
      <td>618</td>
    </tr>
    <tr>
      <td>MMLU</td>
      <td>Acc.</td>
      <td>82.4</td>
      <td style="background-color: #bfbfbf;">81.7 (-0.7%)</td>
      <td>85.2</td>
      <td>82.1</td>
      <td>80.1</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>1087</td>
      <td style="background-color: #bfbfbf;">799 (-17%)</td>
      <td>1041</td>
      <td>774</td>
      <td>312</td>
    </tr>
    <tr>
      <td>GPQA Diamond</td>
      <td>Acc.</td>
      <td>56.8</td>
      <td style="background-color: #bfbfbf;">56.6 (-0.2%)</td>
      <td>52.5</td>
      <td>62.6</td>
      <td>45.5</td>
    </tr>
    <tr>
      <td></td>
      <td>Avg Length</td>
      <td>3503</td>
      <td style="background-color: #bfbfbf;">2148 (-39%)</td>
      <td>3302</td>
      <td>5108</td>
      <td>600</td>
    </tr>
  </tbody>
</table>

**Table 1** 

### Ablations
<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th>Sky-T1-32B-Preview</th>
      <th>Sky-T1-32B-Preview + SimPO</th>
      <th>SFT Shortest Response</th>
      <th>SimPO, math-only, SL</th>
      <th>SimPO, math-only, SL+SILC</th>
      <th>DPO, math+code, SL+SILC</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #F2F2F2;">
      <td>Math500</td>
      <td>Acc.</td>
      <td>88.6</td>
      <td>88.6</td>
      <td>88.6</td>
      <td>88.2</td>
      <td>88.4</td>
      <td>88.8</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>2124</td>
      <td>1417</td>
      <td>2072</td>
      <td>1374</td>
      <td>1409</td>
      <td>1887</td>
    </tr>
    <tr style="background-color: #F2F2F2;">
      <td>AIME24</td>
      <td>Acc.</td>
      <td>43.3</td>
      <td>43.3</td>
      <td>43.3</td>
      <td>36.7</td>
      <td>43.3</td>
      <td>40</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>6881</td>
      <td>4365</td>
      <td>6601</td>
      <td>4094</td>
      <td>4391</td>
      <td>5409</td>
    </tr>
    <tr style="background-color: #F2F2F2;">
      <td>LCB Easy</td>
      <td>Acc.</td>
      <td>87.4</td>
      <td>89</td>
      <td>87.4</td>
      <td>87</td>
      <td>87.2</td>
      <td>87.6</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>3415</td>
      <td>2265</td>
      <td>3218</td>
      <td>2309</td>
      <td>2621</td>
      <td>2777</td>
    </tr>
    <tr style="background-color: #F2F2F2;">
      <td>LCB Medium</td>
      <td>Acc.</td>
      <td>56.8</td>
      <td>56.8</td>
      <td>56.8</td>
      <td>50.5</td>
      <td>51.4</td>
      <td>56.8</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>8263</td>
      <td>4389</td>
      <td>7823</td>
      <td>3972</td>
      <td>6101</td>
      <td>6292</td>
    </tr>
    <tr style="background-color: #F2F2F2;">
      <td>LCB Hard</td>
      <td>Acc.</td>
      <td>17.9</td>
      <td>17.9</td>
      <td>17.9</td>
      <td>13.5</td>
      <td>14.9</td>
      <td>17.5</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>14564</td>
      <td>6199</td>
      <td>14001</td>
      <td>5897</td>
      <td>10203</td>
      <td>11902</td>
    </tr>
    <tr style="background-color: #F2F2F2;">
      <td>MMLU</td>
      <td>Acc.</td>
      <td>82.4</td>
      <td>81.7</td>
      <td>82.4</td>
      <td>81.7</td>
      <td>82.1</td>
      <td>81.7</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>1087</td>
      <td>799</td>
      <td>1062</td>
      <td>795</td>
      <td>804</td>
      <td>899</td>
    </tr>
    <tr style="background-color: #F2F2F2;">
      <td>GPQA Diamond</td>
      <td>Acc.</td>
      <td>56.8</td>
      <td>56.6</td>
      <td>56.8</td>
      <td>56.4</td>
      <td>56.6</td>
      <td>56.6</td>
    </tr>
    <tr style="background-color: #bfbfbf;">
      <td style="background-color: #F2F2F2"></td>
      <td>Avg Length</td>
      <td>3503</td>
      <td>2148</td>
      <td>3438</td>
      <td>2205</td>
      <td>2240</td>
      <td>3048</td>
    </tr>
  </tbody>
</table>

**Table 2**

## Acknowledgement
This work is done at [Berkeley Sky Computing Lab](https://sky.cs.berkeley.edu/) with generous compute support from [Anyscale](https://www.anyscale.com/) and [Lambda Labs](https://lambdalabs.com/service/gpu-cloud?srsltid=AfmBOop5FnmEFTkavVtdZDsLWvHWNg6peXtat-OXJ9MW5GMNsk756PE5).

## Citation
```bibtex
@misc{reduce_overthinking_2025,
  author       = {NovaSky Team},
  title        = {Think Less, Achieve More: Cut Reasoning Costs by 50% Without Sacrificing Accuracy},
  howpublished = {https://novasky-ai.github.io/posts/reduce-overthinking},
  note         = {Accessed: 2025-01-23},
  year         = {2025}
}
