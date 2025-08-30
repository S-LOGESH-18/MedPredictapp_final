
from typing import List
import numpy as np
import pandas as pd

def keyword_flags(df: pd.DataFrame, text_cols: List[str], keywords: List[str]):
    out = pd.DataFrame(index=df.index)
    for kw in keywords:
        patt = kw.lower()
        out[f"kw_{kw}"] = df[text_cols].astype(str).apply(lambda s: s.str.lower().str.contains(patt, na=False)).any(axis=1).astype(int)
    return out

def compute_embeddings(texts: pd.Series, model_name: str):
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(model_name)
    emb = model.encode(texts.fillna("").astype(str).tolist(), batch_size=256, convert_to_numpy=True, normalize_embeddings=True, show_progress_bar=True)
    return emb
