#!/usr/bin/env python3
"""
Gera áudios de notificação para o sistema:
1. Som de dinheiro (cash register)
2. Voz: "Mais um cadastro"
"""

import subprocess
import os

# Criar som de dinheiro usando sox (sintetizado)
def gerar_som_dinheiro():
    output = "/home/user/projeto/public/audio/som-dinheiro.mp3"
    
    # Criar som de "cash register" usando sox
    # Tom alto + reverb para parecer dinheiro caindo
    cmd = """
    sox -n -r 44100 -c 2 /tmp/coin1.wav synth 0.05 sine 800 fade 0 0.05 0.02
    sox -n -r 44100 -c 2 /tmp/coin2.wav synth 0.05 sine 1000 fade 0 0.05 0.02 delay 0.1
    sox -n -r 44100 -c 2 /tmp/coin3.wav synth 0.05 sine 1200 fade 0 0.05 0.02 delay 0.15
    sox -n -r 44100 -c 2 /tmp/register.wav synth 0.3 sine 600 fade 0 0.3 0.1 delay 0.2
    sox -m /tmp/coin1.wav /tmp/coin2.wav /tmp/coin3.wav /tmp/register.wav /tmp/cash.wav
    sox /tmp/cash.wav """ + output + """ reverb 30 norm
    rm /tmp/coin*.wav /tmp/register.wav /tmp/cash.wav
    """
    
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"✅ Som de dinheiro criado: {output}")
        return True
    except:
        print("❌ Erro ao criar som (sox não instalado). Usando alternativa...")
        # Alternativa: criar arquivo vazio ou baixar
        return False

# Criar voz "Mais um cadastro" usando pyttsx3 ou gtts
def gerar_voz_cadastro():
    output = "/home/user/projeto/public/audio/mais-um-cadastro.mp3"
    
    try:
        # Tentar com gtts (Google Text-to-Speech)
        from gtts import gTTS
        tts = gTTS('Mais um cadastro!', lang='pt-br')
        tts.save(output)
        print(f"✅ Voz criada: {output}")
        return True
    except ImportError:
        print("❌ gtts não instalado. Tentando pyttsx3...")
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            engine.setProperty('volume', 1.0)
            # Buscar voz em português
            voices = engine.getProperty('voices')
            for voice in voices:
                if 'portuguese' in voice.name.lower() or 'brazil' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
            engine.save_to_file('Mais um cadastro!', output)
            engine.runAndWait()
            print(f"✅ Voz criada: {output}")
            return True
        except:
            print("❌ Erro ao criar voz. Criando arquivo placeholder...")
            return False

if __name__ == "__main__":
    print("🎵 Gerando áudios de notificação...")
    print()
    
    # Tentar instalar dependências
    print("📦 Instalando dependências...")
    subprocess.run("pip install gtts pydub", shell=True, capture_output=True)
    
    print()
    gerar_som_dinheiro()
    gerar_voz_cadastro()
    
    print()
    print("✅ Concluído! Arquivos salvos em public/audio/")
