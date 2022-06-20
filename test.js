obj = {}
obj2 = {}
arr = []

// obj = {...obj, ...{id:`1`, method:`GET`, url:`/me/drive/root:/{file}:/content`}}

arr.push({...obj, ...{id:`1`, method:`GET`, url:`/me/drive/root:/{file}:/content`}})

obj2 = {requests:arr}







console.log(obj)
console.log(arr)
console.log(obj2)

