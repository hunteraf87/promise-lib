# Библиотека работы с промисами

Функция sleep. Принимает заданное количество миллисекунд и некоторое возвращемое значение.
Возвращает Promise.
 ````js
  sleep(100, 'test').then((data) => {
    console.log(data);       // 'test'
  });
 ````

Функция timeout. Принимает Promise и заданное количество миллисекунд. 
Возвращает Promise.
Если таймаут истекает раньше чем приходит значение от входящего промиса то результирующий промис возвращает ошибку.
Если результат вернулся раньше то выводится результат исходного промиса.
 ````js
 timeout(sleep(500, 'test'), 200)
     .then(console.log)      
     .catch(console.error);   // 'Timeout expired'

 timeout(sleep(500, 'test'), 700)
     .then(console.log)      // 'test'
     .catch(console.error);   
````
   
Функция promisify. Принимает функцию, где последний аргумент thunk-callback и возвращает новую функцию. Новая функция вместо thunk-callback будет возвращать Promise.

 ````js
 function test(param: string, cb: (err: unknown, result: unknown) => void) {
     cb(null, param);
 }
 const test = promisify(test);
 await testPromise('content')
   .then((data) => console.log(data))      // 'content'
   .catch((err) => console.log(err));
 ````

Класс SyncPromise, аналогичный нативному, но работающий синхронно. 
Если синхронность невозможна, то SyncPromise превращается в обычный Promise.
Методы класса SyncPromise аналогичны Promise.
 ````js
 console.log(1);
 const syncPromiseResolved = new SyncPromise(resolve => resolve(2));
 syncPromiseResolved
     .then((data) => console.log(data))
     .catch((err) => console.log(err))
     .finally(() => console.log(3))
 console.log(4);
 // Результат выполнения - 1,2,3,4
 ````
 
 Класс SyncPromise реализует статические методы resolve и reject для упаковки данных в SyncPromise.
 Методы resolve и reject могут принимать также в качестве аргумента контейнер SyncPromise.
 ````js
 SyncPromise.resolve(123).then((data) => console.log(data))
 SyncPromise.reject(123).catch((err) => console.log(err))
 SyncPromise.reject(SyncPromise.resolve(SyncPromise.resolve(123))).catch((err) => console.log(err))
 ````

Класс SyncPromise реализует все статические методы Promise в SyncPromise

 ````js
 // Метод all возвращает SyncPromise, который выполнится тогда, когда будут выполнены все SyncPromise, переданные в виде перечисляемого аргумента, или отклонено любое из переданных SyncPromise.
 SyncPromise.all(iterable)

 // Метод race возвращает SyncPromise, в зависимости от резулатат первого выполненнго SyncPromise из переданных в качестве перечисляемого аргумента.
 SyncPromise.race(iterable) 

 // Метод any возвращает SyncPromise, как только выполнится успешно первый SyncPromise из переданных в качестве перечисляемого аргумента.
 // Если все SyncPromise завершатся с ошибкой то метод any вернет SyncPromise с массивом ошибок
 SyncPromise.any(iterable) 

 // Метод allSettled возвращает SyncPromise, когда все SyncPromise будут завершены из переданных в качестве перечисляемого аргумента.
 // SyncPromise будет содержать массив объектов вида { status: 'fulfilled', value: data } или { status: 'rejected', reason: err }
 SyncPromise.allSettled(iterable) 
 ````

Функция allLimit. Принимает Iterable функций, возвращающих Promise (или обычные значения) и лимит одновременных Promise. 
При выполнении функция контролирует чтобы одновременно не запускается более заданного числа Promise в Pending.
Возвращает Promise с массивом резутатов каждого Promise, или ошибку если хотя бы один Promise завершился с ошибкой.
 ````js
 // В данном примере функции f1, f2, f3, f4, f5, f6 запускаются не сразу, 
 // а с контролем не более 2 одновременно
 allLimit([f1, f2, f3, f4, f5, f6], 2)
     .then((data) => console.log(data))
     .catch(console.error);
 ````



