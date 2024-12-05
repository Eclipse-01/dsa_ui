# -*- coding: gbk -*-
import random
import json
from datetime import datetime, timedelta

def generate_data_entries(num_entries):
    entries = []
    id_counter = 1
    base_time = datetime.strptime("2024-01-20 10:30", "%Y-%m-%d %H:%M")
    data_types = ["心率", "血氧饱和度", "血压", "体温", "呼吸率", "血糖", "心率变异性", "压力水平"]
    units = ["BPM", "%", "mmHg", "°C", "次/分", "mmol/L", "ms", "/5"]

    for _ in range(num_entries):
        entry = {}
        entry['id'] = id_counter
        entry['timestamp'] = (base_time + timedelta(minutes=random.randint(0, 60))).strftime("%Y-%m-%d %H:%M")
        entry['type'] = random.choice(data_types)
        type_index = data_types.index(entry['type'])

        if entry['type'] in ["心率", "呼吸率"]:
            entry['value'] = str(random.randint(50, 150))
        elif entry['type'] == "血氧饱和度":
            entry['value'] = str(random.uniform(95, 100))
        elif entry['type'] == "血压":
            entry['value'] = f"{random.randint(90, 140)}/{random.randint(60, 90)}"
        elif entry['type'] == "体温":
            entry['value'] = f"{random.uniform(36.0, 37.5):.1f}"
        elif entry['type'] == "血糖":
            entry['value'] = f"{random.uniform(4.0, 8.0):.1f}"
        elif entry['type'] == "心率变异性":
            entry['value'] = str(random.randint(20, 100))
        elif entry['type'] == "压力水平":
            entry['value'] = str(random.randint(1, 5))

        entry['unit'] = units[type_index]
        entries.append(entry)
        id_counter += 1

    return entries

def generate_json_data(num_entries):
    entries = generate_data_entries(num_entries)
    json_data = {"vitalDataList": entries}
    return json.dumps(json_data, indent=2, ensure_ascii=False)

# 生成JSON数据并保存到文件
generated_json_data = generate_json_data(100000)
output_file_path = 'app/data/vitalData.json'

# 确保输出目录存在
import os
os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

# 将数据写入文件
with open(output_file_path, 'w', encoding='utf-8') as f:
    f.write(generated_json_data)

print(f"数据已成功保存到: {output_file_path}")
