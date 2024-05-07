---
title: Capability Driven Development
date: 2024-05-01 22:00:0
tags:
- software
- archiecture
--- 


The biggest conflict I see between business and the software development team is: 
```text
What to Build?
```

## The intuitive interpretation

It's only occured to me recently that I view this question differently than most people. Most people would look at this question as the same as:

```text
What does the business need?
```

### What should happen
Let's build what the business is telling us to build right now. That seems to be the most intuitive way to respond to this request, and what most people do. An initial MVP product is converged on, tasks are created, and Developers start to update and create new services.

### What shouldn't happen
Developers should not foresake [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it), and cater for extra requirements the business will never need. Nore should they go off and build abstract platforms and frameworks just because the given imediate business need is not an air tight fit to existing availabile opensource solutions.

Afterall, as long as developers are followings some best practices, the development effort should not be hindered, and the system can be re-archiectured later if need be, which is acceptable and common place and businesses grow, teams expand etc.


## The un-intuitive interpretation

The problem with `What does the business need?` is that sometimes this question is too direct, and we don't actually know. So what happens is the business makes a **business decision**. It decides what it needs. But we don't really decide what we need do we? We just inherently need them. It's an improtant destinction between the two. What we end up deciding on is not necessarily what we need. It's easy for a farming business to know it needs a new tractor, or a restaraunt it needs a new fridge. But it's really hard to know what software to develop because we can't see all the ramifications of the changes we are going to make.

What about instead we changed the question of `What to Build?` to
```text
What Capabilities do we need?
```

I did find one post about these distictions which excited me that others are thinking this way [Service vs. Capability vs. Process](https://www.linkedin.com/pulse/service-vs-capability-process-daniel-dekkers/
) which the author gives great definitions:

 - **Capability:** is the what we do
 - **Process:** is the how we do it (--> how a capability is executed)
 - **Service:** is the how we access it (--> how a capability is accessed)

As far as developers are concerned:
 - Capability Does not contain business logic
 - Service contains business logic

In a Spring Application for example we could consider a `Repository` a capability. But as mentioned the Capabillity should be the what we do, and the service control how all these capabilities are interacting and playing together. But back to the question interpretation, if we develop a capability, we can break up what the business is telling us into what is purely a business decision, which could be a limitation on functionality/capability, it is usually a constraint. And then, the functionality/capability itself. In this way, we free ourselves of the chains of business decisions, and are free to develop great capabilties, and then bake those constraints into the `Service` layer.

Let's take a `SpringJPARepository` as an example. Now the business might tell us that we are never allowed to delete a row in a datbase. Does that mean we can't use a default interface as it has all these methods we cannot use? Ofcourse not we just don't need to make use of that capability, it's there if we need it, but there is no need to spend extra effort to enforce a contraint at the capabiltity level. Instead this constraint can be in the Service level, were delete is just not callable.

We can also ask ourselves why there is no reusable Repository without the delete functionality? Well obviously because that is not as useful, but it's not as useful because a constraint is baked into it. Let's say we change things a little and have a business rule such as 
```text
Cannot delete before 14 days have passed
```
If we put this constraint into our `Repository` layer, and override the delete method, this agian is a constraint going into the Repository Layer. This costraint should go into our `Service` layer as this is a business decision. That's not to say we might develop methods in the repository Layer to help meet business requirements. But we don't hinder a capapability and change the delete function in the repository, because as soon as we do need to delete a record with less than 14 days, say a super admin. We will need to alter our Repository again, as we baked the 14 day constraint into the delete method.



