# -*- coding: gbk -*-
import random
import json
from datetime import datetime, timedelta

# ���峣��
UNITS_MAP = {
    "����": "BPM",
    "Ѫ�����Ͷ�": "%",
    "Ѫѹ": "mmHg",
    "����": "��C",
    "������": "��/��",
    "Ѫ��": "mmol/L",
    "���ʱ�����": "ms",
    "ѹ��ˮƽ": "/5"
}

NORMAL_RANGES = {
    "����": {"min": 60, "max": 100},
    "Ѫ�����Ͷ�": {"min": 95, "max": 100},
    "Ѫѹ": {
        "systolic": {"min": 90, "max": 140},
        "diastolic": {"min": 60, "max": 90}
    },
    "����": {"min": 36.3, "max": 37.2},
    "������": {"min": 12, "max": 20},
    "Ѫ��": {"min": 4.4, "max": 6.7},
    "���ʱ�����": {"min": 30, "max": 90},
    "ѹ��ˮƽ": {"min": 1, "max": 4}
}

ABNORMAL_RANGES = {
    "����": [{"min": 30, "max": 50}, {"min": 120, "max": 180}],
    "Ѫ�����Ͷ�": [{"min": 85, "max": 92}],
    "Ѫѹ": {
        "systolic": [{"min": 70, "max": 90}, {"min": 160, "max": 200}],
        "diastolic": [{"min": 40, "max": 55}, {"min": 100, "max": 120}]
    },
    "����": [{"min": 35.0, "max": 36.0}, {"min": 38.0, "max": 40.0}],
    "������": [{"min": 5, "max": 10}, {"min": 25, "max": 35}],
    "Ѫ��": [{"min": 2.0, "max": 3.9}, {"min": 11.0, "max": 15.0}],
    "���ʱ�����": [{"min": 10, "max": 25}, {"min": 100, "max": 150}],
    "ѹ��ˮƽ": [{"min": 5, "max": 5}]
}

def generate_value(data_type, is_abnormal=False):
    if data_type == "Ѫѹ":
        if is_abnormal:
            systolic_range = random.choice(ABNORMAL_RANGES[data_type]["systolic"])
            diastolic_range = random.choice(ABNORMAL_RANGES[data_type]["diastolic"])
            systolic = random.randint(systolic_range["min"], systolic_range["max"])
            diastolic = random.randint(diastolic_range["min"], diastolic_range["max"])
        else:
            systolic = random.randint(NORMAL_RANGES[data_type]["systolic"]["min"], 
                                    NORMAL_RANGES[data_type]["systolic"]["max"])
            diastolic = random.randint(NORMAL_RANGES[data_type]["diastolic"]["min"], 
                                     NORMAL_RANGES[data_type]["diastolic"]["max"])
        return f"{systolic}/{diastolic}"
    
    ranges = ABNORMAL_RANGES[data_type] if is_abnormal else [NORMAL_RANGES[data_type]]
    selected_range = random.choice(ranges)
    
    if data_type in ["����", "Ѫ�����Ͷ�", "Ѫ��"]:
        return f"{random.uniform(selected_range['min'], selected_range['max']):.1f}"
    else:
        return str(random.randint(selected_range["min"], selected_range["max"]))

def generate_data_entries(num_entries):
    entries = []
    id_counter = 1
    base_time = datetime.strptime("2024-01-15 08:00:00", "%Y-%m-%d %H:%M:%S")
    
    for _ in range(num_entries):
        entry = {}
        entry["id"] = id_counter
        entry["timestamp"] = (base_time + timedelta(minutes=random.randint(0, 60*24*30))).strftime("%Y-%m-%d %H:%M:%S")
        entry["type"] = random.choice(list(NORMAL_RANGES.keys()))
        entry["bed"] = f"{random.randint(1, 4)}�Ŵ�"
        is_abnormal = random.random() < 0.05
        entry["value"] = generate_value(entry["type"], is_abnormal)
        entry["unit"] = UNITS_MAP[entry["type"]]
        entries.append(entry)
        id_counter += 1
    
    return sorted(entries, key=lambda x: x["timestamp"])

def generate_json_data(num_entries):
    entries = generate_data_entries(num_entries)
    json_data = {"vitalDataList": entries}
    return json.dumps(json_data, indent=2, ensure_ascii=False)

# ����JSON���ݲ����浽�ļ�
generated_json_data = generate_json_data(100000)
output_file_path = 'public/data/vitalData.json'  # ע�����ﲻ��Ҫ app ǰ׺

# ȷ�����Ŀ¼����
import os
os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

# ������д���ļ�
with open(output_file_path, 'w', encoding='utf-8') as f:
    f.write(generated_json_data)

print(f"�����ѳɹ����浽: {output_file_path}")
