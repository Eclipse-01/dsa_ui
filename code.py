# -*- coding: gbk -*-
import random
import json
from datetime import datetime, timedelta

def generate_data_entries(num_entries):
    entries = []
    id_counter = 1
    base_time = datetime.strptime("2024-01-20 10:30", "%Y-%m-%d %H:%M")
    data_types = ["����", "Ѫ�����Ͷ�", "Ѫѹ", "����", "������", "Ѫ��", "���ʱ�����", "ѹ��ˮƽ"]
    units = ["BPM", "%", "mmHg", "��C", "��/��", "mmol/L", "ms", "/5"]

    for _ in range(num_entries):
        entry = {}
        entry['id'] = id_counter
        entry['timestamp'] = (base_time + timedelta(minutes=random.randint(0, 60))).strftime("%Y-%m-%d %H:%M")
        entry['type'] = random.choice(data_types)
        type_index = data_types.index(entry['type'])

        if entry['type'] in ["����", "������"]:
            entry['value'] = str(random.randint(50, 150))
        elif entry['type'] == "Ѫ�����Ͷ�":
            entry['value'] = str(random.uniform(95, 100))
        elif entry['type'] == "Ѫѹ":
            entry['value'] = f"{random.randint(90, 140)}/{random.randint(60, 90)}"
        elif entry['type'] == "����":
            entry['value'] = f"{random.uniform(36.0, 37.5):.1f}"
        elif entry['type'] == "Ѫ��":
            entry['value'] = f"{random.uniform(4.0, 8.0):.1f}"
        elif entry['type'] == "���ʱ�����":
            entry['value'] = str(random.randint(20, 100))
        elif entry['type'] == "ѹ��ˮƽ":
            entry['value'] = str(random.randint(1, 5))

        entry['unit'] = units[type_index]
        entries.append(entry)
        id_counter += 1

    return entries

def generate_json_data(num_entries):
    entries = generate_data_entries(num_entries)
    json_data = {"vitalDataList": entries}
    return json.dumps(json_data, indent=2, ensure_ascii=False)

# ����JSON���ݲ����浽�ļ�
generated_json_data = generate_json_data(100000)
output_file_path = 'app/data/vitalData.json'

# ȷ�����Ŀ¼����
import os
os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

# ������д���ļ�
with open(output_file_path, 'w', encoding='utf-8') as f:
    f.write(generated_json_data)

print(f"�����ѳɹ����浽: {output_file_path}")
