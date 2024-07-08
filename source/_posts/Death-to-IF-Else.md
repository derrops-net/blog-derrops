---
title: Death to IF Else Chains
date: 2024-07-06 21:55:21
tags:
- functional programming
- typescript
- javascript
- cyclomatic complexity
---

For many years now, I've written, and looked at code, with many lines of if else statements, and always felt it's a sight for sore eyes:


```typescript
if (something() == otherThing() + 1) {
    incrementCows()
} else if (something() == againThisThing()) {
    incrementSheep()
    incrementCows()
} else if (iveStoppedReadingNow() && !cantTakeThisAnymore()) {
    incrementGiraffes()
    
}
```


It feels like you have to be some sort of chess grand master to understand large sequences of if statements and nested structures, because it forces you to store information in your working memory. You also have to read through all the statements often to understand what is happening in the code. 

## The alternative

Is there an alternative to this approach of else if statements? When looking at a long `List` of if else statements, the `List` collection comes to mind as this seems to be a list after all. So how about we try using a list? And we ask ourselves what about this style of code makes it hard to understand? And that to me seems to be it combines the flow with the implementation of the software together. It would be more simple if the flow of the code was decoupled from the implementation detail.

## User access example
Lets take the example of a user wanting to gain access to a multi-tenant SAAS application:

1. IP Whitelist Check
2. Valid Access Token
3. User not Disabled
4. User Belongs to Tenant

Lets first define a type, `AuthCheck` which takes some `context : AuthContext` object, and performs some check on it:

```typescript
type AuthContext = {
    accessedTenant : {
        ipWhiteList : string,
        tenantId : string,
    },
    user : {
        ipAddress : string,
        username : string,
        tenantId : string,
        enabled : boolean,
        super : boolean,
    },
    headers : {
        accessToken : string
    },
    accessToken : {
        iat : number,
        sub : string,
        // ...
    }
}

type AuthResult = {
    message : string,
    access : boolean,
}

type AuthCheck = (context : AuthContext) => AuthResult

```

Then we can implement each of these checks as follows:

```typescript
const IP_WHITE_LIST_CHECK : AuthCheck = context => ({
    access : ipRangeCheck(ip, context.tenant.ipWhiteList),
    message : `${context.user.ipAddress} was blocked`,
})

const VALID_ACCESS_TOKEN : AuthCheck = context => ({
    access : context.accessToken !== undefined
    message : "Token not valid",
})

const USER_ENABLED_CHECK : AuthCheck = context => ({
    access : context.user.enabled
    message : "User was disabled.",
})

const USER_TENANT_CHECK : AuthCheck = context => ({
    access : context.user.tenantId === accessedTenant.tenantId
    message : `User should access ${accessedTenant.tenantId}, not ${context.user.tenantId}`,
})
```

Then instead of a long list of else if statements, was can simply have a list of checks:

```typescript
const AUTH_CHECKS = [   
    IP_WHITE_LIST_CHECK,
    VALID_ACCESS_TOKEN,
    USER_ENABLED_CHECK,
    USER_BELONGS_TO_TENANT_CHECK,
]
```

By having an array, we have the convenience of all array methods.

```typescript
const access = AUTH_CHECKS.every(check => check(context).access)
const denied = AUTH_CHECKS.some(check => !check(context).access)
const authChecksFailed = AUTH_CHECKS.filter(check => !check(context).access)
const authChecksSucceeded = AUTH_CHECKS.filter(check => check(context).access)
```

We can also simply map the list of checks to their results, and then find the first deny
```typescript
const authCheckResults = AUTH_CHECKS.map(check => check(context))
const denyResult = authCheckResults.find(r => !r.access)
```

If there is any deny, then `denyResult` will be defined


## Wrapping
What about we introduce the concept of a super user, who can access any tenant, and is not subject to ip White listing?
We then need to go in and edit `IP_WHITE_LIST_CHECK` and `USER_BELONGS_TO_TENANT_CHECK`, and we could do that to be:

```typescript
const IP_WHITE_LIST_CHECK : AuthCheck = context => ({
    access : context.user.super || ipRangeCheck(ip, context.tenant.ipWhiteList),
    message : `${context.user.ipAddress} was blocked`,
})
```
But that violates the **Open-closed** principal, and then we should really rename them to be: `IP_WHITE_LIST_OR_SUPER_CHECK`. What about instead we introduce the concept of wrapping checks? Then we have a new type:

```typescript
type AuthCheckWrapper = (c : AuthCheck) => AuthCheck
```

We can then create a super user wrapper:
```typescript
const OR_SUPER_USER = check => context => context.user.super ? {
    access : true,
    message : "super user",
} : check(context)
```

Then we can wrap conditions using this method, and our checks become:
```typescript
const AUTH_CHECKS = [   
    OR_SUPER_USER(IP_WHITE_LIST_CHECK),
    VALID_ACCESS_TOKEN,
    USER_ENABLED_CHECK,
    OR_SUPER_USER(CHECK_USER_BELONGS_TO_TENANT),
]
```
Which is far more readable, and we didn't need to change the behavior of the current implementation.
Like wise we can also introduce the exception wrapper, whereby if any exception occurs during execution of a check, then a boolean value of exception is true, otherwise it is false:

```typescript
export const EXCEPTION_WRAPPER = (check : AuthCheck) => {
    try {
        return {
            ...check(context),
            exception : false,
        }
    } catch (err : any) {
        return {
            access : false,
            exception : true,
            message : "exception occurred during evaluation of check"
        }
    }
}

AUTH_CHECKS.map(EXCEPTION_WRAPPER)
```

### Summary

This approach has many benifits:

1. Can easily change the execution model, i.e. evaluate all checks or evaluate checks till 1st no access
2. Adding behavior is easy, and doesn't break the **Open-closed** principal.
3. Easy to understand the order of checks and what is happening.


### Appendix

Before this code I had something which was like this: and had many issues:

```typescript

const handle = (event, context, callback) =>  {
    
    const accessTokenHeader = event.headers["AccessToken"]

    var decodedJwt 

    try {
        
        decodedJwt = tryDecodeJwt(accessTokenHeader)
        
    } catch (error : any){
        
        makeDenyPolicy(event, { }, context)

    }

    const tenant = findTenant(event)

    if (Math.floor(new Date().getTime() / 1000) > decodedJwt.payload.exp) {
        
        makeDenyPolicy(event, {}, context)

    } else if (!getUser(accessToken).groups.includes(tenant.id)) {

        makeDenyPolicy(event, {tenant}, context)

    } else if (tenant.whiteListIpCidr !== undefined){
        if (containsIp(tenant.whiteListIpCidr, event.requestContext.identity.sourceIp)){
            makeDenyPolicy(event, {tenant}, context)
        } else {
            makeAllowPolicy(event, {tenant}, context)
        }
    }

    var user

    try {
        
        user = cognitoGetUser(accessTokenHeader)
        
    } catch (error : any){
        
        makeDenyPolicy(event, { }, context)

    }

    if (user.eulaVersion == currentEula()) {
        makeAllowPolicy(event, {tenant, user}, context)
    } else {
        makeDenyPolicy(event, {tenant, user}, context)
    }    

}

```