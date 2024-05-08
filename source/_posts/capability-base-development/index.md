---
title: Capability Driven Development
date: 2024-05-01 22:00:0
tags:
- software
- architecture
---

The basic premise of Capability Driven Development, (A Derrops Coined Term) is that:

<span style="font-size:3em;">"Business Logic Should not Constrain Capability"</span>

It's good to first work with a working definitions of terms to break down this statement, here is a good short blog post about the difference between : [Service vs. Capability vs. Process](https://www.linkedin.com/pulse/service-vs-capability-process-daniel-dekkers/
) 

 - **Capability:** is the what we do
 - **Process:** is the how we do it (--> how a capability is executed)
 - **Service:** is the how we access it (--> how a capability is accessed)

![Capability](/images/posts/capability-base-development/capability-archiecture.png)


We'll get to some of these terms shortly, but if we look at Capability it's "what we do". We could also change this a little to be "what we can do", and then in the `Service` level, we control the access and constrain what we do as just because the business can do something, doesn't mean it makes sense to for any number of reasons.

# The Case for Capability Driven Development

## SRP
But just because it doesn't make sense to do something, doesn't mean we should put artificial constraints on our capability. I put forward a number of reasons this is the case, probably the most easiest way to make the case for this is the old: Single-responsibility principal [SRP](https://en.wikipedia.org/wiki/Single-responsibility_principle).

Within an application we have *Business Logic*. Based on **SRP**, *Business Logic|Rules* should not be scattered all over the codebase. But rather reside in the Service Layer, which is the the interface to the business, and speaks the common Domain Specific Language.

## Encapsulation
The other reason is that if we encapsulate the *BL* in the Service Layer, then when the *BL* changes, we only need to change the Service Layer, and we don't need to touch any lower-level libraries. We can always get a good feel for how our code architecture performs when we need to change it. If some high level *BL* were to change, but we still needed for the most part, the same capabilities we had before, but we had to change lower level software components that dealt with uploading files or saving information to a database, that would be a sign that how we have structured our code in a way in which *BL* is not encapsulated, and other un-related functionality is being needed to change.

## Reusability Example
When we have business logic and code in the one place, we cannot reuse that functionality for another context with different business logic. Let's look at some concrete example with a Spring [JpaRepository](https://docs.spring.io/spring-data/data-jpa/docs/current/api/org/springframework/data/jpa/repository/JpaRepository.html). Let's assume we have a `ComplaintEntity` representing a complaint by customers for our business. Now let's say I have a business rule which is that a complaint cannot be deleted within the first 7 days it was created.

Within the `ComplaintRepository`, we can override the delete method with our new rule:

```java
public void deleteById(int id) {
    // TODO check current age of complaint
    // if age < 7 days through an exception
}
```

Funnily enough there is a similiar question on StackOverflow [Spring Data: Override save method](https://stackoverflow.com/questions/13036159/spring-data-override-save-method) and lets look at what the OP ends up doing: 😉
![SO](/images/posts/capability-base-development/override-delete-method-post.png)

Let's assume we do successfully provide our own `default` implementation of this method, and then the business comes along and says to us, we want to allow users to delete their own complaints if they accept one of our explanations.

Well we'd actually lost the normal `delete` capability from our Repository because we baked in a business constraint into the functionality. The same thing could have also been achieved by annotating a method at the Entity level with: `@PreRemove` and doing the check there. If we'd done that then we'd be in real trouble. As we couldn't even implement a new delete method it would still trigger this method, and we'd have to undo our other code and implement both business processes again.

Had we done this in the service layer, firstly it's easy to then find the business logic already present in the application if Capability Driven Development is followed, and then secondly we could add the appropriate logic there which. We can either have 2 different methods each with different security controls placed on it, or a single method with the 2 rules together in the one location with the one method.

Stylistic I would go for having one method, as developers don't need to sort through multiple use-cases. There are other reasons for also keeping the *BR* separate, such as when testing.



## Checklist

An easy way to make sure you are following this is to:
 1. Make sure Services contain all the business logic, but at the same time, services, just like non-technical business people do not deal with lower-level technical details
 - A capability is anything that is not a service. It should not have any business logic or constraints applied to it.



## Business Rules should Guide Capabilities Architecture

The biggest conflict I see between business and the software development team is:
```text
What to Build?
```

## The intuitive interpretation

It's only occurred to me recently that I view this question differently than most people. Most people would look at this question as the same as:

```text
What does the business need?
```

### What should happen
Let's build what the business is telling us to build right now. That seems to be the most intuitive way to respond to this request, and what most people do. An initial MVP product is converged on, tasks are created, and Developers start to update and create new services.

### What shouldn't happen
Developers should not forsake [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it), and cater for extra requirements the business will never need. Nor should they go off and build abstract platforms and frameworks just because the given immediate business need is not an air tight fit to existing availabile opensource solutions.

After all, as long as developers are followings some best practices, the development effort should not be hindered, and the system can be re-architecture later if need be, which is acceptable and common place and businesses grow, teams expand etc.


## The un-intuitive interpretation

The problem with `What does the business need?` is that sometimes this question is too direct, and we don't actually know. So what happens is the business makes a **business decision**. It decides what it needs. But we don't really decide what we need do we? We just inherently need them. It's an important destination between the two. What we end up deciding on is not necessarily what we need. It's easy for a farming business to know it needs a new tractor, or a restaurant it needs a new fridge. But it's really hard to know what software to develop because we can't see all the ramifications of the changes we are going to make.

What about instead we changed the question of `What to Build?` to
```text
What Capabilities do we need?
```

I did find one post about these distinctions which excited me that others are thinking this way [Service vs. Capability vs. Process](https://www.linkedin.com/pulse/service-vs-capability-process-daniel-dekkers/
) which the author gives great definitions:

 - **Capability:** is the what we do
 - **Process:** is the how we do it (--> how a capability is executed)
 - **Service:** is the how we access it (--> how a capability is accessed)

As far as developers are concerned:
 - Capability Does not contain business logic
 - Service contains business logic

In a Spring Application for example we could consider a `Repository` a capability. But as mentioned the Capability should be the what we do, and the service control how all these capabilities are interacting and playing together. But back to the question interpretation, if we develop a capability, we can break up what the business is telling us into what is purely a business decision, which could be a limitation on functionality/capability, it is usually a constraint. And then, the functionality/capability itself. In this way, we free ourselves of the chains of business decisions, and are free to develop great capabilities, and then bake those constraints into the `Service` layer.

Let's take a `SpringJPARepository` as an example. Now the business might tell us that we are never allowed to delete a row in a database. Does that mean we can't use a default interface as it has all these methods we cannot use? Of course not we just don't need to make use of that capability, it's there if we need it, but there is no need to spend extra effort to enforce a constraint at the capability level. Instead this constraint can be in the Service level, were delete is just not callable.

We can also ask ourselves why there is no reusable Repository without the delete functionality? Well obviously because that is not as useful, but it's not as useful because a constraint is baked into it. Let's say we change things a little and have a business rule such as
```text
Cannot delete before 14 days have passed
```
If we put this constraint into our `Repository` layer, and override the delete method, this again is a constraint going into the Repository Layer. This constraint should go into our `Service` layer as this is a business decision. That's not to say we might develop methods in the repository Layer to help meet business requirements. But we don't hinder a capability and change the delete function in the repository, because as soon as we do need to delete a record with less than 14 days, say a super admin. We will need to alter our Repository again, as we baked the 14 day constraint into the delete method.
