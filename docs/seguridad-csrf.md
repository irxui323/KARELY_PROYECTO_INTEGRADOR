# Protección CSRF

La API mantiene la autenticación JWT y habilita la protección CSRF para las operaciones de escritura. Se eliminó la exclusión general de `/api/v1/**` en `SecurityConfig` y se utiliza `csrf.spa()` de Spring Security.

El token CSRF es distinto del JWT: el JWT autentica al usuario y el CSRF comprueba la petición. No se usa la cookie CSRF para autenticar usuarios.

## Angular

`core/interceptors/csrf-interceptor.ts` obtiene inicialmente la cookie `XSRF-TOKEN` mediante `GET /api/v1/health` cuando falta. Después incluye su valor como cabecera `X-XSRF-TOKEN` en las peticiones de escritura a la API. El interceptor de autenticación conserva la cabecera Bearer.

El despliegue debe mantener las llamadas relativas `/api/v1` mediante proxy/reverse proxy en el mismo origen que Angular, tal como en la configuración local. Una migración a orígenes distintos requiere ajustar cookies, credenciales y CORS.

## Postman

1. Ejecutar `GET http://127.0.0.1:8080/api/v1/health`.
2. Conservar la cookie `XSRF-TOKEN` en el cookie jar de Postman.
3. Copiar el valor de esa cookie a la cabecera `X-XSRF-TOKEN` en POST, PUT, PATCH y DELETE, incluido el login.
4. Para endpoints privados, enviar además `Authorization: Bearer <JWT>`.
5. Utilizar el mismo host en todas las peticiones; no alternar `localhost` y `127.0.0.1`.

Una cabecera CSRF ausente o incorrecta produce 403. Después de reiniciar o cambiar de host, se puede volver a solicitar la cookie con el GET inicial.

## Verificación

`RecuperacionSeguridadHttpTest` utiliza la cadena de filtros real y comprueba recuperación sin token (403), token incorrecto (403), cookie y token válidos (202), perfil sin autenticar (401) y peticiones de escritura fuera de la API sin CSRF (403).

SonarQube debe ejecutar un nuevo análisis del backend para reflejar el cambio. El resultado de un Quality Gate solo puede confirmarse después de que termine ese análisis; no basta con modificar el código local.

Referencia: [Spring Security: CSRF en aplicaciones SPA](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html#csrf-integration-javascript-spa).
