---
title: "Sky-T1: Train your own O1 preview model within $450"
slug: sky-t1
description: "We introduce Sky-T1-32B-Preview, our reasoning model that performs on par with o1-preview on popular reasoning and coding benchmarks."
category:
  - One
tags:
  - Post-Training
  - Distillation
pubDate: 2025-01-10
cover: https://raw.githubusercontent.com/NovaSky-AI/novasky-ai.github.io/main/assets/images/blue-bird-wider.jpeg
coverAlt: Blue Bird
author: NovaSky Team
---

We introduce Sky-T1-32B-Preview, our reasoning model that performs on par with o1-preview on popular reasoning and coding benchmarks. **Remarkably, Sky-T1-32B-Preview was trained for less than $450, demonstrating that it is possible to replicate high-level reasoning capabilities affordably and efficiently.** All [code](https://github.com/NovaSky-AI/SkyThought) is open-source. 

![img](https://raw.githubusercontent.com/NovaSky-AI/novasky-ai.github.io/main/assets/images/sky-t1/Sky-T1-pipeline.jpg)

## Overview
Models such as o1 and Gemini 2.0 flash thinking that excel in reasoning have shown to solve complex tasks by producing a long internal chain of thought, among other advancements. However, the technical details and model weights are un-accessible, presenting a barrier to the participation of the academic and open-source communities.

In response, a few notable efforts have emerged to train open-weight reasoning models in the math domain, such as [Still-2](https://arxiv.org/abs/2412.09413) and [Journey](https://arxiv.org/abs/2411.16489). Concurrently, we, the NovaSky team at UC Berkeley, have been exploring various techniques to evolve the reasoning capabilities of base and instruct-tuned models. In this work, we achieve competitive reasoning performance not just in math, but also in coding in the same model.

### Fully Open-source: Driving Progress Together
To ensure our work benefits the broader community, we are fully committed to open-source collaboration. We open-source all details (i.e., data, codes, model weights) to enable the community to replicate and improve on our results *easily*:
 - [**Infrastructure**](https://github.com/NovaSky-AI/SkyThought): to build the data, train, and evaluate the model in a single repository.
 - [**Data**](https://github.com/NovaSky-AI/SkyThought): 17K data used to train Sky-T1-32B-Preview.
 - [**Technical details**](https://novasky-ai.github.io/posts/sky-t1): Our technical [report](https://novasky-ai.github.io/posts/sky-t1/) with a [wandb log](https://api.wandb.ai/links/sky-posttraining-uc-berkeley/wjg3sybl).
 - [**Model weights**](https://huggingface.co/NovaSky-AI): Our 32B model weight.

<table>
  <thead>
    <tr>
      <th>Model</th>
      <th style="background-color: #bfbfbf;"><div align="center">Sky-T1-32B-Preview</div></th>
      <th><div align="center">STILL-2</div></th>
      <th><div align="center">Journey</div></th>
      <th><div align="center">QwQ</div></th>
      <th><div align="center">o1</div></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
      <td style="background-color: #f2f2f2;"><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
    </tr>
    <tr>
      <td>Code</td>
      <td style="background-color: #f2f2f2;"><div align="center">✅</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
    </tr>
    <tr>
      <td>Report</td>
      <td style="background-color: #f2f2f2;"><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
    </tr>
    <tr>
      <td>Math Domain</td>
      <td style="background-color: #f2f2f2;"><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
    </tr>
    <tr>
      <td>Coding Domain</td>
      <td style="background-color: #f2f2f2;"><div align="center">✅</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
    </tr>
    <tr>
      <td>Model Weights</td>
      <td style="background-color: #f2f2f2;"><div align="center">✅</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">❌</div></td>
      <td><div align="center">✅</div></td>
      <td><div align="center">❌</div></td>
    </tr>
  </tbody>
</table>

By sharing all these resources, we aim to empower the academic and open-source communities to build on our work, explore new possibilities, and push the boundaries of reasoning model development.

## Recipes
### Data Curation Process
To generate our training data we use QwQ-32B-Preview, an open-source model with reasoning capabilities comparable to o1-preview. We curate the data mixture  (see later section) to cover diverse domains that require reasoning, and a reject sampling procedure to improve the data quality. We then rewrite QwQ traces with GPT-4o-mini into a well-formatted version, inspired by [Still-2](https://arxiv.org/abs/2412.09413), to improve data quality and ease parsing. We particularly find the ease of parsing advantageous for reasoning models - they are trained to respond in a particular format, where results are often hard to parse. For instance, on the APPs dataset, without reformatting, we can only assume that the code is written in the last code block, where QwQ only achieves ~25% accuracy. However, sometimes code can be written in the middle, where after reformatting, the accuracy is boosted to higher than 90%.

**Rejection Sampling:** We discard QwQ samples if they are incorrect according to the solutions provided in datasets. For Math problems, we do exact matching with the ground truth solutions. For coding problems, we execute the unit tests provided in datasets. Our final data contains 5k coding data from APPs and TACO, and 10k math data from AIME, MATH, and Olympiads subsets of the NuminaMATH dataset. In addition, we maintain 1k science and puzzle data from STILL-2.

### Training
We use our training data to fine tune Qwen2.5-32B-Instruct, an open source model without reasoning capabilities. The model is trained with 3 epochs, learning rate 1e-5 and batch size 96. The model training finishes in 19 hours on 8 H100 with DeepSpeed Zero-3 offload (~ $450 according to Lambda Cloud pricing). We use [Llama-Factory](https://github.com/hiyouga/LLaMA-Factory) to perform training.

### Evaluation and Results
<table>
  <thead>
    <tr>
      <th></th>
      <th style="background-color: #bfbfbf;">Sky-T1-32B-Preview</th>
      <th>Qwen-2.5-32B-Instruct</th>
      <th>QwQ</th>
      <th>o1-preview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Math500</td>
      <td style="background-color: #F2F2F2;">82.4</td>
      <td>76.2</td>
      <td>85.4</td>
      <td>81.4</td>
    </tr>
    <tr>
      <td>AIME2024</td>
      <td style="background-color: #F2F2F2;">43.3</td>
      <td>16.7</td>
      <td>50.0</td>
      <td>40.0</td>
    </tr>
    <tr>
      <td>LiveCodeBench-Easy</td>
      <td style="background-color: #F2F2F2;">86.3</td>
      <td>84.6</td>
      <td>90.7</td>
      <td>92.9</td>
    </tr>
    <tr>
      <td>LiveCodeBench-Medium</td>
      <td style="background-color: #F2F2F2;">56.8</td>
      <td>40.8</td>
      <td>56.3</td>
      <td>54.9</td>
    </tr>
    <tr>
      <td>LiveCodeBench-Hard</td>
      <td style="background-color: #F2F2F2;">17.9</td>
      <td>9.8</td>
      <td>17.1</td>
      <td>16.3</td>
    </tr>
    <tr>
      <td>GPQA-Diamond</td>
      <td style="background-color: #F2F2F2;">56.8</td>
      <td>45.5</td>
      <td>52.5</td>
      <td>75.2</td>
    </tr>
  </tbody>
</table>


## Other findings
**Model size matters.** We initially experimented with training on smaller models (7B and 14B) but observed only modest improvements. For example, training Qwen2.5-14B-Coder-Instruct on the APPs dataset resulted in a slight performance increase on LiveCodeBench from 42.6% to 46.3%. However, upon manually inspecting outputs from smaller models (those smaller than 32B), we found that they frequently generated repetitive content, limiting their effectiveness.


**Data mixture matters.** We initially trained a 32B model using 3–4K math problems from the Numina dataset (provided by STILL-2), achieving a significant improvement in AIME24 accuracy from 16.7% to 43.3%. However, when we incorporated coding data generated from the APPs dataset into the training process, AIME24 accuracy dropped to 36.7%. We hypothesize that this decline is due to the distinct reasoning approaches required for math and coding tasks.

Reasoning in coding often involves additional logical steps, such as simulating test inputs or internally executing generated code, whereas reasoning for math problems tends to be more direct and structured. To address these differences, we enriched the training data with challenging math problems from the NuminaMath dataset and complex coding tasks from the TACO dataset. This balanced data mixture enabled the model to excel in both domains, restoring 43.3% accuracy on AIME24 while also improving its coding capabilities.

## Future work
Sky-T1-32B-Preview marks the start of our journey to develop open-sourced models with advanced reasoning capabilities. Moving forward, we will focus on developing more efficient models that maintain strong reasoning performance and exploring advanced techniques that further enhance the models’ efficiency and accuracy at test time. Stay tuned as we make progress on these exciting initiatives.


## Acknowledgement
This work is done at [Berkeley Sky Computing Lab](https://sky.cs.berkeley.edu/), with the amazing compute support from [Lambda Labs](https://lambdalabs.com/service/gpu-cloud?srsltid=AfmBOop5FnmEFTkavVtdZDsLWvHWNg6peXtat-OXJ9MW5GMNsk756PE5) and [Anyscale](https://www.anyscale.com/). We would like to express our gratitude for the valuable academic feedback and support from the [Still-2 Team](https://arxiv.org/pdf/2412.09413), and Junyang Lin from the [Qwen Team](https://qwenlm.github.io/).

## Citation
```bibtex
@misc{sky_t1_2025,
  author       = {NovaSky Team},
  title        = {Sky-T1: Train your own O1 preview model within $450},
  howpublished = {https://novasky-ai.github.io/posts/sky-t1},
  note         = {Accessed: 2025-01-09},
  year         = {2025}
}
