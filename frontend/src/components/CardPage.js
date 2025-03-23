import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CardPage = () => {
  const { username } = useParams(); // Get the 'username' param from the URL
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await axios.get(`/api/cards/${username}`);
        setCard(response.data);
      } catch (err) {
        setError('Card not found');
      }
    };

    if (username) {
      fetchCardData();
    }
  }, [username]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!card) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card-container">
      <h1>{card.display_name}</h1>
      <p>{card.bio}</p>

      <div className="social-icons">
        {card.social_medias.map((social, index) => (
          <a key={index} href={social.link} target="_blank" rel="noopener noreferrer">
            <i className={`fa-brands ${social.icon}`}></i>
          </a>
        ))}
      </div>

      <div className="action-buttons">
        {card.action_buttons.map((button, index) => (
          <a key={index} href={button.link} className="action-btn">
            {button.text}
          </a>
        ))}
      </div>

      <img src={card.card_pic} alt="Card Profile" className="profile-pic" />

      <div className="floating-actions">
        {card.floating_actions.map((action, index) => (
          <a key={index} href={action.link} className="floating-action">
            <i className={`fa ${action.icon}`}></i>
            <span>{action.type}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CardPage;
