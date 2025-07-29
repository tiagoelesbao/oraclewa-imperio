import logger from '../utils/logger.js';
import { getInstancesStatus as getStatus } from '../services/whatsapp/manager.js';
import axios from 'axios';

export const getInstancesStatus = async (req, res) => {
  try {
    const instances = getStatus();
    
    res.json({
      instances,
      summary: {
        total: instances.length,
        connected: instances.filter(i => i.status === 'connected').length,
        disconnected: instances.filter(i => i.status === 'disconnected').length,
        error: instances.filter(i => i.status === 'error').length
      }
    });
  } catch (error) {
    logger.error('Error fetching instances status:', error);
    res.status(500).json({ error: 'Failed to fetch instances status' });
  }
};

export const generateQRCode = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const instance = getStatus().find(i => i.id === instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    const evolutionUrl = `${process.env.EVOLUTION_API_URL}:${instance.port}`;
    const apiKey = process.env[`EVOLUTION_API_KEY_${instanceId.split('-')[1]}`];

    const response = await axios.get(`${evolutionUrl}/instance/connect`, {
      headers: {
        'apikey': apiKey
      }
    });

    if (response.data.qrcode) {
      res.json({
        instanceId,
        qrcode: response.data.qrcode,
        status: 'pending'
      });
    } else {
      res.json({
        instanceId,
        status: 'already_connected'
      });
    }
  } catch (error) {
    logger.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

export const disconnectInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const instance = getStatus().find(i => i.id === instanceId);
    
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    const evolutionUrl = `${process.env.EVOLUTION_API_URL}:${instance.port}`;
    const apiKey = process.env[`EVOLUTION_API_KEY_${instanceId.split('-')[1]}`];

    await axios.delete(`${evolutionUrl}/instance/logout`, {
      headers: {
        'apikey': apiKey
      }
    });

    logger.info(`Instance ${instanceId} disconnected`);

    res.json({
      success: true,
      message: 'Instance disconnected successfully'
    });
  } catch (error) {
    logger.error('Error disconnecting instance:', error);
    res.status(500).json({ error: 'Failed to disconnect instance' });
  }
};