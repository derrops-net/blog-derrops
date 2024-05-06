---
title: Denesting Opensearch
date: 2024-05-01 21:09:30
tags:
- opensearch
- typescript
- elasticsearch
- opensearch-typescript
---


![Nest](/images/bees-nest.jpg)
Opensearch is a powerful tool for searching through documents, providing developers with powerful abstractions to construct complex querries, often having a deeply nested structure, which can become deeply nested at times. Is this nest more like a bee nest leading to stings? Or a comfy bird nest? Lets do some examples and see where we go. These examples will make use of the sample data available at : `/_dashboards/app/home#/tutorial_directory`.

## eCommerce
Lets say I want compare trends in product lines throughout the year in different geographical zones, as well as the zones for all categories. The structure of this would be `date histogram by month -> geographic zone -> total sales`. Whilst fairly straight forward to say and comprehend this query in opensearch is as follows:

```json

```


