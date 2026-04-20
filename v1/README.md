# Gestor de Notas - Versión 1 (MVP)

## Descripción

Primera versión del gestor de notas. Implementa las funcionalidades básicas CRUD:

- ✅ Crear notas con título y contenido
- ✅ Ver lista de notas
- ✅ Editar notas existentes
- ✅ Eliminar notas
- ✅ Persistencia en localStorage

## ⚠️ Estado de Seguridad

**Esta versión contiene vulnerabilidades XSS deliberadas con fines educativos.**

Las notas se renderizan con `innerHTML` sin ninguna sanitización, lo que permite
la ejecución de código malicioso.

## Cómo usar

Abrir `index.html` en el navegador. No requiere servidor.

## Commit

```
feat: Crear gestor básico de notas con funcionalidades CRUD
```
