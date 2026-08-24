# ============================================================
# AARBI CLOTHING — Backend (Express API + Inventory Dashboard)
# Railway is Dockerfile ko use karke backend deploy karega.
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Pehle sirf dependency files copy karo (cache-friendly build)
COPY inventory-dashboard/backend/package.json inventory-dashboard/backend/package-lock.json ./inventory-dashboard/backend/
RUN cd inventory-dashboard/backend && npm install --omit=dev

# Backend source + frontend (Express frontend ko static serve karta hai)
COPY inventory-dashboard/backend ./inventory-dashboard/backend
COPY inventory-dashboard/frontend ./inventory-dashboard/frontend

WORKDIR /app/inventory-dashboard/backend

# Railway automatically PORT env deta hai; fallback 3000
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]