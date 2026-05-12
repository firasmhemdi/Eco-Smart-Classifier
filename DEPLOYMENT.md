# Deploiement gratuit

Ce projet peut etre deploye en une seule application Docker fullstack :

- frontend React compile ;
- backend FastAPI ;
- modeles `models/*.pkl` ;
- endpoints API ;
- interface web.

## Option recommandee : Render

Render peut construire le projet directement depuis le `Dockerfile` a la racine.
Le fichier `render.yaml` fournit deja la configuration gratuite :

- service web ;
- runtime Docker ;
- plan `free` ;
- health check `/health` ;
- deploiement automatique apres validation CI.

Etapes :

1. Aller sur Render.
2. Creer un nouveau `Blueprint` ou un nouveau `Web Service`.
3. Connecter le depot GitHub `firasmhemdi/Eco-Smart-Classifier`.
4. Choisir la branche `main`.
5. Si Web Service manuel : choisir Docker comme runtime / language.
6. Si Web Service manuel : garder le Dockerfile par defaut `./Dockerfile`.
7. Si Web Service manuel : health check path `/health`.
8. Lancer le deploiement.

Le conteneur utilise automatiquement la variable `PORT` si Render la fournit.

URLs apres deploiement :

- Application web : `https://...onrender.com`
- Health API : `https://...onrender.com/health`
- API docs : `https://...onrender.com/docs`
- Stats : `https://...onrender.com/data/stats`

## Option alternative : Hugging Face Spaces Docker

Hugging Face Spaces peut aussi executer un Dockerfile public.

Pour cette option :

1. Creer un nouveau Space.
2. Choisir SDK : Docker.
3. Copier le contenu du depot dans le Space.
4. Configurer le port de l'application sur `8000`.
5. Laisser le Space construire le Dockerfile.

## Test local de l'image fullstack

Construire :

```bash
docker build -t eco-smart-fullstack .
```

Lancer :

```bash
docker run --rm -p 8000:8000 eco-smart-fullstack
```

Verifier :

- Web : http://localhost:8000
- Health : http://localhost:8000/health
- Docs : http://localhost:8000/docs

## Note

Pour simplifier ce projet d'etude, les modeles et le dataset sont suivis directement par Git.
DVC reste present pour documenter et verifier les artefacts.
