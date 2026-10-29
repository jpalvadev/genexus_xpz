#!/usr/bin/env python3
"""Capture live API responses as JSON fixtures for frontend contract-schema tests.
Run with the API up:  scripts/with-api.sh scripts/capture-fixtures.py
Fixtures land in frontend/src/test/fixtures/ regardless of CWD.
"""
import json
import os
import urllib.request

BASE = 'http://localhost:5281/api/v1'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'test', 'fixtures')
os.makedirs(OUT, exist_ok=True)

def get(path):
    req = urllib.request.Request(BASE + path, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def post(path, body):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

from datetime import date
today = date.today().isoformat()
seed_obs = post('/security-observations', {
    'observationDate': today,
    'task': 'Prueba',
    'lugar': 'planta',
    'plantId': 1,
    'sectorId': 2,
    'contractorCompanyId': 3,
    'observers': [{'observerId': 1}, {'observerId': 2}],
    'aprReviewed': True, 'taskRealized': True, 'requiresAtrReview': False,
    'trcRisk': True, 'impactRiskControlled': True, 'handInjuryMeasures': False,
    'injuryMeasures': True, 'toolsReviewed': True, 'mobileEquipmentReviewed': False,
    'energyReviewed': True, 'ladderReviewed': False, 'electricalEquipmentCircuitBreaker': True,
    'controlesCriticos': 'critico',
    'gestionRiesgo': ['Charla de Riesgo Diario (DRT)'],
    'protocolosMortales': ['Trabajo en Altura'],
    'clasificacionObservacion': ['Condición Segura'],
    'relacionObservacion': ['Relacionado con la Tarea'],
    'resumenObservacion': 'PRueba',
    'detalleAI': 'PRueba',
    'descripcionAC': 'PRueba',
})

obs_list = get('/security-observations?Page=1&PageSize=3&OrderBy=id%20desc')
obs = get(f"/security-observations/{seed_obs['id']}")
plant_list = get('/plants?Page=1&PageSize=10&OrderBy=id%20asc')
sector_list = get('/sectors?Page=1&PageSize=10&OrderBy=id%20asc')
company_list = get('/contractor-companies?Page=1&PageSize=10&OrderBy=id%20asc')
observer_list = get('/observers?Page=1&PageSize=10&OrderBy=legajo%20asc')
combo_all = get('/combo-options')
combo_keys = get('/combo-options/keys')
combo_key = get('/combo-options/gestionRiesgo')

fixtures = {
    'security-observation.response.json': obs,
    'security-observation-list.response.json': obs_list,
    'plant-list.response.json': plant_list,
    'sector-list.response.json': sector_list,
    'contractor-company-list.response.json': company_list,
    'observer-list.response.json': observer_list,
    'combo-options.response.json': combo_all,
    'combo-options-keys.response.json': combo_keys,
    'combo-options-key.response.json': combo_key,
}

for name, payload in fixtures.items():
    with open(f'{OUT}/{name}', 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print('wrote', name)

print('keys:', combo_keys)
